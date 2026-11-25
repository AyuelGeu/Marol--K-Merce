const express = require('express');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const PlatformSettings = require('../models/PlatformSettings');
const createPaidOrder = require('../utils/createPaidOrder');
const { sendDeliveryConfirmationEmail } = require('../utils/sendEmail');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadProductImage = require('../middleware/productImageUpload');
const getValidatedProductFields = require('../utils/productValidation');

const router = express.Router();
const uploadsDirectory = path.join(__dirname, '..', 'uploads');

const getAdminSettingsData = async (settings) => {
    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - 29);
    const dailySales = await Payment.aggregate([
        { $match: { status: 'paid' } },
        { $addFields: { salesDate: { $ifNull: ['$transactionDate', '$createdAt'] } } },
        { $match: { salesDate: { $gte: start, $lte: now } } },
        { $unwind: '$items' },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$salesDate',
                        timezone: 'UTC'
                    }
                },
                grossSales: {
                    $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    const commissionRate = settings?.dailyCommissionPercentage || 0;

    return {
        dailyCommissionPercentage: commissionRate,
        payoutPhoneNumber: settings?.payoutPhoneNumber || '',
        updatedAt: settings?.updatedAt || null,
        transfersEnabled: false,
        dailyCommission: dailySales.map((sale) => ({
            date: sale._id,
            grossSales: Number(sale.grossSales.toFixed(2)),
            commissionAmount: Number((sale.grossSales * commissionRate / 100).toFixed(2))
        }))
    };
};

const removeUploadedImage = async (file) => {
    if (!file) return;
    try {
        await fs.unlink(path.join(uploadsDirectory, path.basename(file.filename)));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Unable to remove an unused product image:', error);
        }
    }
};

const removeUploadedImages = async (files = {}) => {
    const uploadedFiles = Object.values(files).flat();
    await Promise.all(uploadedFiles.map(removeUploadedImage));
};

const removeStoredImage = async (imageUrl) => {
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) return;
    try {
        await fs.unlink(path.join(uploadsDirectory, path.basename(imageUrl)));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Unable to remove a replaced product image:', error);
        }
    }
};

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate({
                path: 'vendor',
                match: {
                    role: 'vendor',
                    'vendorProfile.isApproved': true,
                    'vendorProfile.storeNameStatus': 'approved',
                    'vendorProfile.storeName': { $ne: '' }
                },
                select: 'vendorProfile.storeName'
            })
            .sort({ createdAt: -1 });

        return res.status(200).json(products
            .filter((product) => product.vendor)
            .map((product) => ({
                id: product._id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                isAvailable: product.inventory > 0,
                imageUrl: product.imageUrl,
                galleryUrls: product.galleryUrls || [],
                vendorId: product.vendor._id,
                storeName: product.vendor.vendorProfile.storeName
            })));
    } catch (error) {
        console.error('Marketplace product listing error:', error);
        return res.status(500).json({ message: 'Unable to load marketplace products' });
    }
});

router.get('/vendor/products', protect, authorize('vendor'), async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json(products);
    } catch (error) {
        console.error('Vendor product listing error:', error);
        return res.status(500).json({ message: 'Unable to load your products' });
    }
});

router.post('/products', protect, authorize('vendor'), uploadProductImage, async (req, res) => {
    const productFields = getValidatedProductFields(req.body);
    if (!productFields) {
        await removeUploadedImages(req.files);
        return res.status(400).json({ message: 'Enter a product name, category, positive whole-number price, and non-negative whole-number inventory.' });
    }

    if (!req.productThumbnailUrl) {
        await removeUploadedImages(req.files);
        return res.status(400).json({ message: 'A product thumbnail is required.' });
    }

    if (!req.user.vendorProfile?.isApproved ||
        req.user.vendorProfile.storeNameStatus !== 'approved' ||
        !req.user.vendorProfile.storeName?.trim()) {
        await removeUploadedImages(req.files);
        return res.status(403).json({ message: 'Your vendor account and store name must be approved before listing products.' });
    }

    try {
        const product = await Product.create({
            vendor: req.user._id,
            ...productFields,
            imageUrl: req.productThumbnailUrl,
            galleryUrls: req.productGalleryUrls || []
        });
        return res.status(201).json(product);
    } catch (error) {
        await removeUploadedImages(req.files);
        console.error('Vendor product creation error:', error);
        return res.status(500).json({ message: 'Unable to publish this product' });
    }
});

router.put('/products/:productId', protect, authorize('vendor'), (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    return next();
}, uploadProductImage, async (req, res) => {

    const productFields = getValidatedProductFields(req.body);
    if (!productFields) {
        await removeUploadedImages(req.files);
        return res.status(400).json({ message: 'Enter a product name, category, positive whole-number price, and non-negative whole-number inventory.' });
    }

    try {
        const existingProduct = await Product.findOne({
            _id: req.params.productId,
            vendor: req.user._id
        }).select('imageUrl galleryUrls');
        if (!existingProduct) {
            await removeUploadedImages(req.files);
            return res.status(404).json({ message: 'Product not found in your catalog.' });
        }

        const updateFields = { ...productFields };
        if (req.productThumbnailUrl) {
            updateFields.imageUrl = req.productThumbnailUrl;
        }
        const isReplacingGallery = Boolean(req.files?.gallery?.length);
        if (isReplacingGallery) {
            updateFields.galleryUrls = req.productGalleryUrls;
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.productId, vendor: req.user._id },
            { $set: updateFields },
            { returnDocument: 'after', runValidators: true }
        );
        if (!product) {
            await removeUploadedImages(req.files);
            return res.status(404).json({ message: 'Product not found in your catalog.' });
        }

        if (req.productThumbnailUrl) {
            await removeStoredImage(existingProduct.imageUrl);
        }
        if (isReplacingGallery) {
            await Promise.all((existingProduct.galleryUrls || []).map(removeStoredImage));
        }

        return res.status(200).json(product);
    } catch (error) {
        await removeUploadedImages(req.files);
        console.error('Vendor product update error:', error);
        return res.status(500).json({ message: 'Unable to update this product' });
    }
});

router.delete('/products/:productId', protect, authorize('vendor'), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    try {
        const product = await Product.findOne({
            _id: req.params.productId,
            vendor: req.user._id
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found in your catalog.' });
        }

        const hasOpenOrders = await Order.exists({
            'items.product': product._id,
            status: { $nin: ['cancelled', 'completed'] }
        });
        if (hasOpenOrders) {
            return res.status(409).json({
                message: 'This product cannot be deleted while it has open orders.'
            });
        }

        await Product.deleteOne({ _id: product._id, vendor: req.user._id });
        await removeStoredImage(product.imageUrl);
        await Promise.all((product.galleryUrls || []).map(removeStoredImage));

        return res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Vendor product deletion error:', error);
        return res.status(500).json({ message: 'Unable to delete this product' });
    }
});

router.post('/orders', protect, authorize('customer'), async (req, res) => {
    const { paymentId } = req.body;
    if (typeof paymentId !== 'string' || !mongoose.Types.ObjectId.isValid(paymentId)) {
        return res.status(402).json({ message: 'A valid confirmed payment is required before placing this order.' });
    }

    try {
        const payment = await Payment.findOne({
            _id: paymentId,
            customer: req.user._id,
            status: 'paid'
        });
        if (!payment) {
            return res.status(402).json({ message: 'Payment must be confirmed before placing this order.' });
        }

        const order = await createPaidOrder(payment);

        return res.status(201).json({
            id: order._id,
            total: order.total,
            status: order.status,
            createdAt: order.createdAt
        });
    } catch (error) {
        console.error('Paid customer order creation error:', error);
        return res.status(500).json({ message: 'Unable to place your order' });
    }
});

router.get('/admin/settings', protect, authorize('admin'), async (req, res) => {
    try {
        const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
        return res.status(200).json(await getAdminSettingsData(settings));
    } catch (error) {
        console.error('Admin settings load error:', error);
        return res.status(500).json({ message: 'Unable to load admin settings.' });
    }
});

router.put('/admin/settings', protect, authorize('admin'), async (req, res) => {
    const commissionPercentage = Number(req.body?.dailyCommissionPercentage);
    if (!Number.isFinite(commissionPercentage) ||
        commissionPercentage < 0 ||
        commissionPercentage > 100 ||
        Math.round(commissionPercentage * 100) / 100 !== commissionPercentage) {
        return res.status(400).json({
            message: 'Commission percentage must be between 0 and 100 with up to two decimal places.'
        });
    }

    const phoneDigits = String(req.body?.payoutPhoneNumber || '').replace(/\D/g, '');
    const payoutPhoneNumber = phoneDigits.startsWith('0')
        ? `254${phoneDigits.slice(1)}`
        : phoneDigits.startsWith('7') || phoneDigits.startsWith('1')
            ? `254${phoneDigits}`
            : phoneDigits;
    if (payoutPhoneNumber && !/^254[17]\d{8}$/.test(payoutPhoneNumber)) {
        return res.status(400).json({
            message: 'Enter a valid Kenyan M-Pesa phone number or leave it blank.'
        });
    }

    try {
        const settings = await PlatformSettings.findOneAndUpdate(
            { key: 'platform' },
            {
                $set: {
                    dailyCommissionPercentage: commissionPercentage,
                    payoutPhoneNumber,
                    updatedBy: req.user._id
                },
                $setOnInsert: { key: 'platform' }
            },
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );
        return res.status(200).json(await getAdminSettingsData(settings));
    } catch (error) {
        console.error('Admin settings update error:', error);
        return res.status(500).json({ message: 'Unable to save admin settings.' });
    }
});

router.get('/admin/payments', protect, authorize('admin'), async (req, res) => {
    try {
        const salesTrendEnd = new Date();
        const salesTrendStart = new Date(salesTrendEnd);
        salesTrendStart.setUTCHours(0, 0, 0, 0);
        salesTrendStart.setUTCDate(salesTrendStart.getUTCDate() - 29);

        const vendorTotals = await Payment.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        vendor: '$items.vendor',
                        storeName: '$items.storeName',
                        payment: '$_id',
                        status: '$status'
                    },
                    amount: {
                        $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        vendor: '$_id.vendor',
                        storeName: '$_id.storeName'
                    },
                    paidAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$_id.status', 'paid'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$_id.status', 'pending'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    reviewAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$_id.status', 'review'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    failedAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$_id.status', 'failed'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    paidTransactions: {
                        $sum: { $cond: [{ $eq: ['$_id.status', 'paid'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id.vendor',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            { $unwind: '$vendor' },
            { $match: { 'vendor.role': 'vendor' } },
            {
                $project: {
                    vendorId: '$_id.vendor',
                    name: { $ifNull: ['$vendor.name', 'Vendor'] },
                    email: { $ifNull: ['$vendor.email', ''] },
                    storeName: '$_id.storeName',
                    paidAmount: 1,
                    pendingAmount: 1,
                    reviewAmount: 1,
                    failedAmount: 1,
                    paidTransactions: 1
                }
            },
            { $sort: { paidAmount: -1, name: 1 } }
        ]);

        const salesTrend = await Payment.aggregate([
            { $match: { status: 'paid' } },
            { $addFields: { salesDate: { $ifNull: ['$transactionDate', '$createdAt'] } } },
            { $match: { salesDate: { $gte: salesTrendStart, $lte: salesTrendEnd } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$salesDate',
                                timezone: 'UTC'
                            }
                        },
                        vendor: '$items.vendor',
                        storeName: '$items.storeName'
                    },
                    amount: {
                        $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id.vendor',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            { $unwind: '$vendor' },
            { $match: { 'vendor.role': 'vendor' } },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    storeId: {
                        $concat: [
                            { $toString: '$_id.vendor' },
                            ':',
                            { $ifNull: ['$_id.storeName', 'Store'] }
                        ]
                    },
                    storeName: { $ifNull: ['$_id.storeName', 'Store'] },
                    vendorName: { $ifNull: ['$vendor.name', 'Vendor'] },
                    amount: 1
                }
            },
            { $sort: { date: 1, storeName: 1 } }
        ]);

        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('customer', 'name email')
            .populate('items.vendor', 'name email role vendorProfile.storeName')
            .lean();

        const recentPayments = payments.map((payment) => {
            const vendorBreakdown = new Map();
            for (const item of payment.items || []) {
                if (!item.vendor || item.vendor.role !== 'vendor') continue;
                const vendorId = item.vendor._id.toString();
                const storeName = item.storeName || 'Store';
                const storeKey = `${vendorId}:${storeName}`;

                const current = vendorBreakdown.get(storeKey) || {
                    vendorId,
                    vendorName: item.vendor?.name || 'Vendor',
                    storeName,
                    amount: 0
                };
                current.amount += item.unitPrice * item.quantity;
                vendorBreakdown.set(storeKey, current);
            }

            return {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                receiptNumber: payment.mpesaReceiptNumber || '',
                transactionDate: payment.transactionDate || payment.createdAt,
                customerName: payment.customer?.name || 'Customer',
                customerEmail: payment.customer?.email || '',
                vendors: [...vendorBreakdown.values()].map((vendor) => ({
                    ...vendor,
                    amount: Number(vendor.amount.toFixed(2))
                }))
            };
        });

        return res.status(200).json({ vendorTotals, recentPayments, salesTrend });
    } catch (error) {
        console.error('Admin payment tracking error:', error);
        return res.status(500).json({ message: 'Unable to load payment tracking data.' });
    }
});

router.get('/orders/mine', protect, authorize('customer'), async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.user._id,
            status: { $ne: 'cancelled' }
        }).sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Customer order listing error:', error);
        return res.status(500).json({ message: 'Unable to load your orders' });
    }
});

router.put('/orders/:orderId/cancel', protect, authorize('customer'), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ message: 'Invalid order ID.' });
    }

    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.orderId,
                customer: req.user._id,
                status: 'pending'
            },
            { $set: { status: 'cancelled' } },
            { returnDocument: 'after', runValidators: true }
        );

        if (order) {
            return res.status(200).json(order);
        }

        const existingOrder = await Order.findOne({
            _id: req.params.orderId,
            customer: req.user._id
        }).select('status');
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        return res.status(409).json({
            message: existingOrder.status === 'cancelled'
                ? 'This order has already been cancelled.'
                : 'Only pending orders can be cancelled.'
        });
    } catch (error) {
        console.error('Customer order cancellation error:', error);
        return res.status(500).json({ message: 'Unable to cancel this order.' });
    }
});

router.get('/orders/vendor', protect, authorize('vendor'), async (req, res) => {
    try {
        const orders = await Order.find({ 'items.vendor': req.user._id })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json(orders.map((order) => {
            const vendorItems = order.items.filter((item) => item.vendor.equals(req.user._id));
            return {
                id: order._id,
                createdAt: order.createdAt,
                status: order.status,
                deliveryStatus: vendorItems.every((item) => item.deliveryStatus === 'delivered')
                    ? 'delivered'
                    : 'pending',
                customer: {
                    name: order.customer?.name || 'Customer',
                    email: order.customer?.email || ''
                },
                items: vendorItems.map((item) => ({
                    productName: item.productName,
                    storeName: item.storeName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    deliveryStatus: item.deliveryStatus,
                    deliveredAt: item.deliveredAt
                })),
                total: Number(vendorItems
                    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                    .toFixed(2))
            };
        }));
    } catch (error) {
        console.error('Vendor order listing error:', error);
        return res.status(500).json({ message: 'Unable to load your orders' });
    }
});

router.put('/orders/:orderId/deliver', protect, authorize('vendor'), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ message: 'Invalid order ID.' });
    }

    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            'items.vendor': req.user._id
        }).populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found for this vendor.' });
        }
        if (order.status === 'cancelled') {
            return res.status(409).json({ message: 'A cancelled order cannot be marked as delivered.' });
        }

        const vendorItems = order.items.filter((item) => item.vendor.equals(req.user._id));
        const undeliveredItems = vendorItems.filter((item) => item.deliveryStatus !== 'delivered');
        if (undeliveredItems.length === 0) {
            return res.status(409).json({ message: 'Your items in this order are already marked as delivered.' });
        }
        if (!order.customer?.email) {
            return res.status(422).json({ message: 'The customer does not have an email address for delivery confirmation.' });
        }

        const deliveredAt = new Date();
        await sendDeliveryConfirmationEmail(order.customer.email, {
            customerName: order.customer.name,
            orderId: order._id.toString(),
            storeName: undeliveredItems[0].storeName,
            items: undeliveredItems.map((item) => ({
                productName: item.productName,
                quantity: item.quantity
            })),
            deliveredAt
        });

        undeliveredItems.forEach((item) => {
            item.deliveryStatus = 'delivered';
            item.deliveredAt = deliveredAt;
        });
        order.status = order.items.every((item) => item.deliveryStatus === 'delivered')
            ? 'completed'
            : 'processing';
        await order.save();

        return res.status(200).json({
            id: order._id,
            status: order.status,
            deliveryStatus: 'delivered',
            deliveredAt
        });
    } catch (error) {
        console.error('Vendor delivery confirmation error:', error);
        return res.status(500).json({
            message: 'Unable to confirm delivery and send the customer email.'
        });
    }
});

module.exports = router;
