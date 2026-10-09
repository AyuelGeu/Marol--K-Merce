const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    storeName: {
        type: String,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: 'An order must contain at least one item'
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
