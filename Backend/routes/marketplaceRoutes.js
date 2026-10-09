const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const isValidImageUrl = (value) => {
    if (!value) return true;
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
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

router.post('/products', protect, authorize('vendor'), async (req, res) => {
    const { name, description = '', category, price, imageUrl = '' } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const numericPrice = Number(price);
    const trimmedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    if (!trimmedName || trimmedName.length > 120 || trimmedDescription.length > 2000 ||
        !trimmedCategory || trimmedCategory.length > 60 || !Number.isFinite(numericPrice) ||
        numericPrice <= 0 || numericPrice > 1000000000 ||
        Math.abs(numericPrice * 100 - Math.round(numericPrice * 100)) > 1e-7 ||
        trimmedImageUrl.length > 2048 || !isValidImageUrl(trimmedImageUrl)) {
        return res.status(400).json({ message: 'Enter a product name, category, positive price, and valid image URL.' });
    }

    if (!req.user.vendorProfile?.isApproved ||
        req.user.vendorProfile.storeNameStatus !== 'approved' ||
        !req.user.vendorProfile.storeName?.trim()) {
        return res.status(403).json({ message: 'Your vendor account and store name must be approved before listing products.' });
    }

    try {
        const product = await Product.create({
            vendor: req.user._id,
            name: trimmedName,
            description: trimmedDescription,
            category: trimmedCategory,
            price: numericPrice,
            imageUrl: trimmedImageUrl
        });
        return res.status(201).json(product);
    } catch (error) {
        console.error('Vendor product creation error:', error);
        return res.status(500).json({ message: 'Unable to publish this product' });
    }
});

router.post('/orders', protect, authorize('customer'), async (req, res) => {
    const requestedItems = req.body.items;
    if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
        return res.status(400).json({ message: 'Add between 1 and 50 products to your order.' });
    }

    const quantitiesByProduct = new Map();
    for (const item of requestedItems) {
        if (!item || typeof item.productId !== 'string' ||
            !mongoose.Types.ObjectId.isValid(item.productId) ||
            !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
            return res.status(400).json({ message: 'Your cart contains an invalid product or quantity.' });
        }
        quantitiesByProduct.set(
            item.productId,
            (quantitiesByProduct.get(item.productId) || 0) + item.quantity
        );
    }

    if ([...quantitiesByProduct.values()].some((quantity) => quantity > 99)) {
        return res.status(400).json({ message: 'A product quantity cannot exceed 99.' });
    }

    try {
        const products = await Product.find({
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

        if (products.length !== quantitiesByProduct.size || products.some((product) => !product.vendor)) {
            return res.status(409).json({ message: 'One or more products are no longer available. Refresh the marketplace and try again.' });
        }

        const items = products.map((product) => ({
            product: product._id,
            vendor: product.vendor._id,
            productName: product.name,
            storeName: product.vendor.vendorProfile.storeName,
            unitPrice: product.price,
            quantity: quantitiesByProduct.get(product._id.toString())
        }));
        const total = Number(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2));
        const order = await Order.create({
            customer: req.user._id,
            items,
            total
        });

        return res.status(201).json({
            id: order._id,
            total: order.total,
            status: order.status,
            createdAt: order.createdAt
        });
    } catch (error) {
        console.error('Customer order creation error:', error);
        return res.status(500).json({ message: 'Unable to place your order' });
    }
});

router.get('/orders/mine', protect, authorize('customer'), async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
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
