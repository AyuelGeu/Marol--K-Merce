const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const createPaidOrder = require("../utils/createPaidOrder");

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

// Initiate an STK Push using product prices verified on the server.
exports.stkPush = async (req, res) => {
  const { items: requestedItems, phoneNumber } = req.body;
  const normalizedPhone = normalizePhone(phoneNumber);

  if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
    return res.status(400).json({ error: "Enter a valid Kenyan M-Pesa phone number." });
  }

  if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
    return res.status(400).json({ error: "Add between 1 and 50 products to your payment." });
  }

  const quantitiesByProduct = new Map();
  for (const item of requestedItems) {
    if (!item || typeof item.productId !== "string" ||
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return res.status(400).json({ error: "Your cart contains an invalid product or quantity." });
    }
    quantitiesByProduct.set(
      item.productId,
      (quantitiesByProduct.get(item.productId) || 0) + item.quantity
    );
  }

  if ([...quantitiesByProduct.values()].some((quantity) => quantity > 99)) {
    return res.status(400).json({ error: "A product quantity cannot exceed 99." });
  }

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!shortCode || !passkey || !callbackUrl || !req.mpesaToken) {
    console.error("M-Pesa STK Push configuration is incomplete.");
    return res.status(500).json({ error: "M-Pesa payments are not configured." });
  }

  let products;
  try {
    products = await Product.find({
      _id: { $in: [...quantitiesByProduct.keys()] },
      isActive: true
    }).populate({
      path: "vendor",
      match: {
        role: "vendor",
        "vendorProfile.isApproved": true,
        "vendorProfile.storeNameStatus": "approved",
        "vendorProfile.storeName": { $ne: "" }
      },
      select: "vendorProfile.storeName"
    });
  } catch (error) {
    console.error("M-Pesa cart validation error:", error);
    return res.status(500).json({ error: "Unable to verify your cart." });
  }

  if (products.length !== quantitiesByProduct.size || products.some((product) => !product.vendor)) {
    return res.status(409).json({ error: "One or more products are no longer available. Refresh the marketplace and try again." });
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
      error: "M-Pesa checkout requires a whole-number total in KSh, up to KSh 150,000."
    });
  }

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

  let payment;
  try {
    payment = await Payment.create({
      resultCode: 0,
      resultDesc: "Waiting for M-Pesa payment confirmation.",
      amount,
      phoneNumber: normalizedPhone,
      timestamp: new Date(),
      customer: req.user._id,
      items: orderItems,
      status: "pending"
    });

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: normalizedPhone,
        PartyB: shortCode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: "K-Merce",
        TransactionDesc: "Marketplace order"
      },
      {
        headers: {
          Authorization: "Bearer " + req.mpesaToken
        }
      }
    );

    if (String(response.data?.ResponseCode) !== "0" ||
        !response.data?.CheckoutRequestID || !response.data?.MerchantRequestID) {
      console.error("M-Pesa rejected STK Push:", response.data);
      payment.status = "failed";
      payment.resultDesc = response.data?.ResponseDescription || "M-Pesa did not accept the payment request.";
      await payment.save();
      return res.status(502).json({
        error: payment.resultDesc
      });
    }

    payment.merchantRequestID = response.data.MerchantRequestID;
    payment.checkoutRequestID = response.data.CheckoutRequestID;
    payment.resultDesc = response.data.ResponseDescription || "STK Push initiated";
    await payment.save();

    return res.status(202).json({
      message: "M-Pesa payment request sent. Approve it on your phone to place the order.",
      paymentId: payment._id,
      amount
    });
  } catch (error) {
    console.error("STK Push error:", error.response?.data || error.message);
    if (payment) {
      payment.status = error.response ? "failed" : "review";
      payment.resultCode = Number(error.response?.status) || -1;
      payment.resultDesc = error.response
        ? "M-Pesa rejected the payment request."
        : "M-Pesa payment request outcome could not be confirmed. Check your phone before retrying.";
      try {
        await payment.save();
      } catch (saveError) {
        console.error("Unable to save M-Pesa payment initiation result:", saveError);
      }
      return res.status(502).json({
        error: payment.resultDesc,
        paymentId: payment._id
      });
    }
    return res.status(500).json({ error: "Unable to prepare M-Pesa payment." });
  }
};

// Acknowledge callbacks while only creating orders for verified successful payments.
exports.stkCallback = async (req, res) => {
  const callbackData = req.body?.Body?.stkCallback;
  if (!callbackData) {
    return res.status(200).send("Callback received");
  }

  try {
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;
    const payment = await Payment.findOne({ checkoutRequestID: CheckoutRequestID });
    if (!payment) {
      console.error("M-Pesa callback did not match a pending payment:", CheckoutRequestID);
      return res.status(200).send("Callback received");
    }

    if (Number(ResultCode) !== 0) {
      if (payment.status === "pending") {
        payment.status = "failed";
        payment.resultCode = Number(ResultCode);
        payment.resultDesc = ResultDesc || "M-Pesa payment failed.";
        await payment.save();
      }
      return res.status(200).send("Callback received");
    }

    const metadata = Array.isArray(CallbackMetadata?.Item) ? CallbackMetadata.Item : [];
    const getMetadataValue = (name) =>
      metadata.find((item) => item.Name === name)?.Value ??
      metadata.find((item) => item.Name === name)?.value;
    const amount = Number(getMetadataValue("Amount"));
    const phoneNumber = normalizePhone(getMetadataValue("PhoneNumber"));
    const transactionDate = getMetadataValue("TransactionDate");

    const receiptNumber = getMetadataValue("MpesaReceiptNumber");
    if (amount !== payment.amount || phoneNumber !== payment.phoneNumber ||
        !receiptNumber ||
        MerchantRequestID !== payment.merchantRequestID) {
      payment.status = "review";
      payment.resultCode = Number(ResultCode);
      payment.resultDesc = "Payment details did not match the requested amount or phone number.";
      await payment.save();
      console.error("M-Pesa payment requires review due to mismatched callback details:", CheckoutRequestID);
      return res.status(200).send("Callback received");
    }

    payment.status = "paid";
    payment.resultCode = Number(ResultCode);
    payment.resultDesc = ResultDesc || "M-Pesa payment confirmed.";
    payment.amount = amount;
    payment.mpesaReceiptNumber = receiptNumber;
    payment.phoneNumber = phoneNumber;
    payment.transactionDate = transactionDate
      ? moment(String(transactionDate), "YYYYMMDDHHmmss").toDate()
      : undefined;
    payment.timestamp = new Date();

    await payment.save();
    await createPaidOrder(payment);
  } catch (error) {
    console.error("Unable to process M-Pesa callback:", error);
  }

  return res.status(200).send("Callback received");
};

exports.paymentStatus = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.paymentId)) {
    return res.status(400).json({ message: "Invalid payment ID." });
  }

  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      customer: req.user._id
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment was not found." });
    }

    let order = null;
    if (payment.status === "paid") {
      order = await createPaidOrder(payment);
    }

    return res.status(200).json({
      status: payment.status,
      resultDesc: payment.resultDesc,
      order: order ? { id: order._id, status: order.status } : null
    });
  } catch (error) {
    console.error("M-Pesa payment status error:", error);
    return res.status(500).json({ message: "Unable to retrieve payment status." });
  }
};
