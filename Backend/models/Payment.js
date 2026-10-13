const mongoose = require('mongoose');

const paymentItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
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
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  merchantRequestID: {
    type: String,
    sparse: true,
  },
  checkoutRequestID: {
    type: String,
    sparse: true,
  },
  resultCode: {
    type: Number,
    required: true,
  },
  resultDesc: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  mpesaReceiptNumber: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  transactionDate: {
    type: Date,
  },
  timestamp: {
    type: Date,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
    index: true
  },
  items: {
    type: [paymentItemSchema],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'review'],
    default: 'pending',
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
});
module.exports = mongoose.model('Payment', paymentSchema);