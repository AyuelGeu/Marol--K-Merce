const express = require('express');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const createPaidOrder = require('../utils/createPaidOrder');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadProductImage = require('../middleware/productImageUpload');

const router = express.Router();
const uploadsDirectory = path.join(__dirname, '..', 'uploads');

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

const getValidatedProductFields = (body) => {
    const { name, description = '', category, price } = body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const numericPrice = Number(price);

    if (!trimmedName || trimmedName.length > 120 || trimmedDescription.length > 2000 ||
        !trimmedCategory || trimmedCategory.length > 60 || !Number.isFinite(numericPrice) ||
        numericPrice <= 0 || numericPrice > 1000000000 ||
        !Number.isInteger(numericPrice)) {
        return null;
    }

    return {
        name: trimmedName,
        description: trimmedDescription,
        category: trimmedCategory,
        price: numericPrice
    };
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
                imageUrl: product.imageUrl,
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
        await removeUploadedImage(req.file);
        return res.status(400).json({ message: 'Enter a product name, category, and positive whole-number price.' });
    }

    if (!req.user.vendorProfile?.isApproved ||
        req.user.vendorProfile.storeNameStatus !== 'approved' ||
        !req.user.vendorProfile.storeName?.trim()) {
        await removeUploadedImage(req.file);
        return res.status(403).json({ message: 'Your vendor account and store name must be approved before listing products.' });
    }

    try {
        const product = await Product.create({
            vendor: req.user._id,
            ...productFields,
            imageUrl: req.productImageUrl || ''
        });
        return res.status(201).json(product);
    } catch (error) {
        await removeUploadedImage(req.file);
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
        await removeUploadedImage(req.file);
        return res.status(400).json({ message: 'Enter a product name, category, and positive whole-number price.' });
    }

    try {
        const updateFields = { ...productFields };
        if (req.productImageUrl) {
            updateFields.imageUrl = req.productImageUrl;
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.productId, vendor: req.user._id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );
        if (!product) {
            await removeUploadedImage(req.file);
            return res.status(404).json({ message: 'Product not found in your catalog.' });
        }

        return res.status(200).json(product);
    } catch (error) {
        await removeUploadedImage(req.file);
        console.error('Vendor product update error:', error);
        return res.status(500).json({ message: 'Unable to update this product' });
    }
});

router.post('/orders', protect, authorize('customer'), async (req, res) => {
    const { paymentId } = req.body;
    if (typeof paymentId !== 'string' || !mongoose.Types.ObjectId.isValid(paymentId)) {
        return res.status(402).json({ message: 'Complete M-Pesa payment before placing this order.' });
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
            { new: true, runValidators: true }
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

        return res.status(200).json(orders.map((order) => ({
            id: order._id,
            createdAt: order.createdAt,
            status: order.status,
            customer: {
                name: order.customer?.name || 'Customer',
                email: order.customer?.email || ''
            },
            items: order.items
                .filter((item) => item.vendor.equals(req.user._id))
                .map((item) => ({
                    productName: item.productName,
                    storeName: item.storeName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity
                })),
            total: Number(order.items
                .filter((item) => item.vendor.equals(req.user._id))
                .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                .toFixed(2))
        })));
    } catch (error) {
        console.error('Vendor order listing error:', error);
        return res.status(500).json({ message: 'Unable to load your orders' });
    }
});

module.exports = router;
