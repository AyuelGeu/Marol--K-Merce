const axios = require('axios');
const moment = require('moment');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const createPaidOrder = require('../utils/createPaidOrder');
const { sendPaymentReceiptEmail } = require('../utils/sendEmail');

const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
  return digits;
};

const STK_QUERY_INTERVAL_MS = 15000;
const PAYMENT_CONFIRMATION_TIMEOUT_MS = 180000;
const RECEIPT_EMAIL_LOCK_TIMEOUT_MS = 300000;

const sendReceiptEmailOnce = async (payment, order) => {
  const now = new Date();
  const claimedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: 'paid',
      receiptEmailSentAt: { $exists: false },
      $or: [
        { receiptEmailSendingAt: { $exists: false } },
        { receiptEmailSendingAt: { $lte: new Date(now.getTime() - RECEIPT_EMAIL_LOCK_TIMEOUT_MS) } }
      ]
    },
    { $set: { receiptEmailSendingAt: now } },
    { returnDocument: 'after' }
  ).populate('customer', 'email name');

  if (!claimedPayment) return;
  if (!claimedPayment.customer?.email) {
    await Payment.updateOne(
      { _id: claimedPayment._id, receiptEmailSendingAt: now },
      { $unset: { receiptEmailSendingAt: 1 } }
    );
    console.error('Payment confirmed, but no customer email is available for the receipt:', claimedPayment._id);
    return;
  }

  try {
    await sendPaymentReceiptEmail(claimedPayment.customer.email, {
      paymentId: claimedPayment._id.toString(),
      orderId: order?._id?.toString() || claimedPayment.order?.toString() || '',
      customerName: claimedPayment.customer.name,
      receiptNumber: claimedPayment.mpesaReceiptNumber,
      transactionDate: claimedPayment.transactionDate || claimedPayment.updatedAt || now,
      phoneNumber: claimedPayment.phoneNumber,
      amount: claimedPayment.amount,
      items: claimedPayment.items.map((item) => ({
        productName: item.productName,
        storeName: item.storeName,
        unitPrice: item.unitPrice,
        quantity: item.quantity
      }))
    });
    await Payment.updateOne(
      { _id: claimedPayment._id, receiptEmailSendingAt: now },
      {
        $set: { receiptEmailSentAt: new Date() },
        $unset: { receiptEmailSendingAt: 1 }
      }
    );
  } catch (error) {
    await Payment.updateOne(
      { _id: claimedPayment._id, receiptEmailSendingAt: now },
      { $unset: { receiptEmailSendingAt: 1 } }
    );
    console.error('Unable to email the confirmed payment receipt:', error);
  }
};

exports.stkPush = async (req, res) => {
  const { items: requestedItems, phoneNumber } = req.body;
  const normalizedPhone = normalizePhone(phoneNumber);

  if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
    return res.status(400).json({ error: 'Enter a valid Kenyan M-Pesa phone number.' });
  }
  if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
    return res.status(400).json({ error: 'Add between 1 and 50 products to your payment.' });
  }

  const quantitiesByProduct = new Map();
  for (const item of requestedItems) {
    if (!item || typeof item.productId !== 'string' ||
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return res.status(400).json({ error: 'Your cart contains an invalid product or quantity.' });
    }
    quantitiesByProduct.set(
      item.productId,
      (quantitiesByProduct.get(item.productId) || 0) + item.quantity
    );
  }
  if ([...quantitiesByProduct.values()].some((quantity) => quantity > 99)) {
    return res.status(400).json({ error: 'A product quantity cannot exceed 99.' });
  }

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!shortcode || !passkey || !callbackUrl || !req.mpesaToken || !req.mpesaBaseUrl) {
    console.error('M-Pesa STK Push configuration is incomplete.');
    return res.status(503).json({ error: 'M-Pesa payments are not fully configured.' });
  }

  let products;
  try {
    products = await Product.find({
      _id: { $in: [...quantitiesByProduct.keys()] },
      isActive: true
    }).populate({
      path: 'vendor',
      match: {
        role: 'vendor',
        'vendorProfile.isApproved': true,
        'vendorProfile.storeNameStatus': 'approved',
        'vendorProfile.storeName': { $ne: '' }
      },
      select: 'vendorProfile.storeName'
    });
  } catch (error) {
    console.error('M-Pesa cart validation error:', error);
    return res.status(500).json({ error: 'Unable to verify your cart.' });
  }

  if (products.length !== quantitiesByProduct.size || products.some((product) => !product.vendor)) {
    return res.status(409).json({
      error: 'One or more products are no longer available. Refresh the marketplace and try again.'
    });
  }

  const orderItems = products.map((product) => ({
    product: product._id,
    vendor: product.vendor._id,
    productName: product.name,
    storeName: product.vendor.vendorProfile.storeName,
    unitPrice: product.price,
    quantity: quantitiesByProduct.get(product._id.toString())
  }));
  const amount = Number(orderItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity, 0
  ).toFixed(2));
  if (!Number.isInteger(amount) || amount < 1 || amount > 150000) {
    return res.status(400).json({
      error: 'M-Pesa checkout requires a whole-number total in KSh, up to KSh 150,000.'
    });
  }

  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  let payment;
  try {
    payment = await Payment.create({
      resultCode: -1,
      resultDesc: 'Waiting for M-Pesa payment confirmation.',
      amount,
      phoneNumber: normalizedPhone,
      customer: req.user._id,
      items: orderItems,
      status: 'pending'
    });

    const response = await axios.post(
      `${req.mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: normalizedPhone,
        PartyB: shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: 'K-Merce',
        TransactionDesc: 'Marketplace order'
      },
      { headers: { Authorization: `Bearer ${req.mpesaToken}` } }
    );

    if (String(response.data?.ResponseCode) !== '0') {
      payment.status = 'failed';
      payment.resultCode = Number(response.data?.ResponseCode) || -1;
      payment.resultDesc = response.data?.ResponseDescription || 'M-Pesa rejected the payment request.';
      await payment.save();
      return res.status(502).json({ error: payment.resultDesc });
    }
    if (!response.data?.CheckoutRequestID || !response.data?.MerchantRequestID) {
      payment.status = 'review';
      payment.resultDesc = 'M-Pesa accepted the request but did not return a payment reference. Check your phone before retrying.';
      await payment.save();
      return res.status(202).json({
        message: payment.resultDesc,
        paymentId: payment._id,
        amount
      });
    }

    payment.checkoutRequestID = response.data.CheckoutRequestID;
    payment.merchantRequestID = response.data.MerchantRequestID;
    payment.resultDesc = response.data.ResponseDescription || 'STK Push initiated.';
    await payment.save();
    return res.status(202).json({
      message: 'M-Pesa payment request sent. Approve it on your phone to place the order.',
      paymentId: payment._id,
      amount
    });
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    if (payment) {
      const isDefinitiveRejection = error.response?.status >= 400 &&
        error.response.status < 500;
      payment.status = isDefinitiveRejection ? 'failed' : 'review';
      payment.resultCode = Number(error.response?.status) || -1;
      payment.resultDesc = isDefinitiveRejection
        ? 'M-Pesa rejected the payment request.'
        : 'The payment request outcome could not be confirmed. Check your phone before retrying.';
      try {
        await payment.save();
      } catch (saveError) {
        console.error('Unable to save M-Pesa payment initiation result:', saveError);
      }
      return res.status(502).json({
        error: payment.resultDesc,
        paymentId: payment._id
      });
    }
    return res.status(500).json({ error: 'Unable to prepare M-Pesa payment.' });
  }
};

exports.stkCallback = async (req, res) => {
  const callbackData = req.body?.Body?.stkCallback;
  if (!callbackData) return res.status(200).send('Callback received');

  try {
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;
    const payment = await Payment.findOne({ checkoutRequestID: CheckoutRequestID });
    if (!payment) {
      console.error('M-Pesa callback did not match a payment:', CheckoutRequestID);
      return res.status(200).send('Callback received');
    }
    if (payment.status !== 'pending') return res.status(200).send('Callback received');

    const code = Number(ResultCode);
    if (code !== 0) {
      payment.status = 'failed';
      payment.resultCode = code;
      payment.resultDesc = ResultDesc || 'M-Pesa payment was not completed.';
      await payment.save();
      return res.status(200).send('Callback received');
    }

    const metadata = Array.isArray(CallbackMetadata?.Item) ? CallbackMetadata.Item : [];
    const getValue = (name) => metadata.find((item) => item.Name === name)?.Value;
    const amount = Number(getValue('Amount'));
    const phoneNumber = normalizePhone(getValue('PhoneNumber'));
    const receiptNumber = getValue('MpesaReceiptNumber');
    const transactionDate = getValue('TransactionDate');
    if (amount !== payment.amount || phoneNumber !== payment.phoneNumber || !receiptNumber ||
        (MerchantRequestID && MerchantRequestID !== payment.merchantRequestID)) {
      payment.status = 'review';
      payment.resultCode = code;
      payment.resultDesc = 'Payment details did not match the requested amount or phone number. Contact support to verify this payment.';
      await payment.save();
      console.error('M-Pesa callback details require review:', CheckoutRequestID);
      return res.status(200).send('Callback received');
    }

    payment.status = 'paid';
    payment.resultCode = code;
    payment.resultDesc = ResultDesc || 'M-Pesa payment confirmed.';
    payment.mpesaReceiptNumber = receiptNumber;
    payment.transactionDate = transactionDate
      ? moment(String(transactionDate), 'YYYYMMDDHHmmss').toDate()
      : undefined;
    await payment.save();
    const order = await createPaidOrder(payment);
    await sendReceiptEmailOnce(payment, order);
  } catch (error) {
    console.error('Unable to process M-Pesa callback:', error);
  }
  return res.status(200).send('Callback received');
};

exports.paymentStatus = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.paymentId)) {
    return res.status(400).json({ message: 'Invalid payment ID.' });
  }

  try {
    let payment = await Payment.findOne({
      _id: req.params.paymentId,
      customer: req.user._id
    });
    if (!payment) return res.status(404).json({ message: 'Payment was not found.' });

    if (payment.status === 'pending' && payment.checkoutRequestID &&
        Date.now() - (payment.createdAt?.getTime() || Date.now()) >= 8000) {
      const checkedAt = new Date();
      const eligibleAfter = new Date(checkedAt.getTime() - STK_QUERY_INTERVAL_MS);
      const paymentToQuery = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: 'pending',
          $or: [
            { lastStatusCheckAt: { $exists: false } },
            { lastStatusCheckAt: null },
            { lastStatusCheckAt: { $lte: eligibleAfter } }
          ]
        },
        { $set: { lastStatusCheckAt: checkedAt } },
        { returnDocument: 'after' }
      );

      if (paymentToQuery) {
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        if (!shortcode || !passkey || !req.mpesaToken || !req.mpesaBaseUrl) {
          console.error('M-Pesa status query configuration is incomplete.');
        } else {
          const timestamp = moment().format('YYYYMMDDHHmmss');
          const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
          try {
            const response = await axios.post(
              `${req.mpesaBaseUrl}/mpesa/stkpushquery/v1/query`,
              {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: paymentToQuery.checkoutRequestID
              },
              { headers: { Authorization: `Bearer ${req.mpesaToken}` } }
            );
            const result = response.data;
            const resultCode = Number(result?.ResultCode);
            const idsMatch = !result?.CheckoutRequestID ||
              result.CheckoutRequestID === paymentToQuery.checkoutRequestID;

            if (String(result?.ResponseCode) === '0' &&
                result?.ResultCode !== undefined && Number.isInteger(resultCode) && idsMatch) {
              const currentPayment = await Payment.findById(paymentToQuery._id);
              if (currentPayment?.status === 'pending') {
                if (result.MerchantRequestID &&
                    result.MerchantRequestID !== currentPayment.merchantRequestID) {
                  currentPayment.status = 'review';
                  currentPayment.resultDesc = 'M-Pesa returned a different merchant request ID. Contact support to verify the transaction.';
                } else {
                  currentPayment.status = resultCode === 0 ? 'paid' : 'failed';
                  currentPayment.resultCode = resultCode;
                  currentPayment.resultDesc = result.ResultDesc ||
                    (resultCode === 0 ? 'M-Pesa payment confirmed.' : 'M-Pesa payment was not completed.');
                }
                await currentPayment.save();
                if (currentPayment.status === 'paid') {
                  const order = await createPaidOrder(currentPayment);
                  await sendReceiptEmailOnce(currentPayment, order);
                }
              }
            } else if (result?.CheckoutRequestID && !idsMatch) {
              await Payment.updateOne(
                { _id: paymentToQuery._id, status: 'pending' },
                {
                  $set: {
                    status: 'review',
                    resultDesc: 'M-Pesa returned a different checkout request ID. Contact support to verify the transaction.'
                  }
                }
              );
            }
          } catch (error) {
            console.error('M-Pesa STK status query failed:', error.response?.data || error.message);
          }
        }
      }

      payment = await Payment.findById(payment._id);
      if (payment.status === 'pending' &&
          Date.now() - (payment.createdAt?.getTime() || Date.now()) >= PAYMENT_CONFIRMATION_TIMEOUT_MS) {
        await Payment.updateOne(
          { _id: payment._id, status: 'pending' },
          {
            $set: {
              status: 'review',
              resultDesc: 'M-Pesa has not confirmed this payment yet. Check your M-Pesa messages or contact support before trying again.'
            }
          }
        );
        payment = await Payment.findById(payment._id);
      }
    }

    const order = payment.status === 'paid' ? await createPaidOrder(payment) : null;
    if (payment.status === 'paid') await sendReceiptEmailOnce(payment, order);
    return res.status(200).json({
      status: payment.status,
      resultDesc: payment.resultDesc,
      order: order ? { id: order._id, status: order.status } : null
    });
  } catch (error) {
    console.error('M-Pesa payment status error:', error);
    return res.status(500).json({ message: 'Unable to retrieve payment status.' });
  }
};