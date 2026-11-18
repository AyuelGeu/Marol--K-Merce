const mongoose = require('mongoose');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

exports.reserveForPayment = async (paymentFields) => {
    const session = await mongoose.startSession();
    let payment;

    try {
        await session.withTransaction(async () => {
            for (const item of paymentFields.items) {
                const reservedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        isActive: true,
                        inventory: { $gte: item.quantity }
                    },
                    { $inc: { inventory: -item.quantity } },
                    { returnDocument: 'after', session }
                );

                if (!reservedProduct) {
                    const error = new Error('One or more products no longer have enough inventory.');
                    error.code = 'INSUFFICIENT_INVENTORY';
                    error.productName = item.productName;
                    throw error;
                }
            }

            const [createdPayment] = await Payment.create(
                [{ ...paymentFields, inventoryStatus: 'reserved' }],
                { session }
            );
            payment = createdPayment;
        });

        return payment;
    } finally {
        await session.endSession();
    }
};

exports.releaseForFailedPayment = async (paymentId) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findOneAndUpdate(
                {
                    _id: paymentId,
                    status: 'failed',
                    inventoryStatus: 'reserved'
                },
                { $set: { inventoryStatus: 'released' } },
                { returnDocument: 'after', session }
            );

            if (!payment) return;

            for (const item of payment.items) {
                await Product.updateOne(
                    { _id: item.product },
                    { $inc: { inventory: item.quantity } },
                    { session }
                );
            }
        });
    } finally {
        await session.endSession();
    }
};
