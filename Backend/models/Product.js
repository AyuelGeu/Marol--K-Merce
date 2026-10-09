const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ''
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    price: {
        type: Number,
        required: true,
        min: 0.01,
        max: 1000000000
    },
    imageUrl: {
        type: String,
        trim: true,
        maxlength: 2048,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
