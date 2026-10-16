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
    sparse: true
  },
  checkoutRequestID: {
    type: String,
    sparse: true
  },
  resultCode: {
    type: Number,
    required: true,
    default: -1
  },
  resultDesc: {
    type: String,
    required: true,
    default: 'Waiting for M-Pesa payment confirmation.'
  },
  amount: {
    type: Number,
    required: true
  },
  mpesaReceiptNumber: String,
  phoneNumber: String,
  transactionDate: Date,
  receiptEmailSentAt: Date,
  receiptEmailSendingAt: Date,
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
  lastStatusCheckAt: Date,
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
