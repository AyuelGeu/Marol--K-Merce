const Order = require('../models/Order');

module.exports = async (payment) => {
    let order = await Order.findOne({ payment: payment._id });

    if (!order) {
        try {
            order = await Order.create({
                customer: payment.customer,
                items: payment.items,
                total: payment.amount,
                payment: payment._id
            });
        } catch (error) {
            if (error.code !== 11000) {
                throw error;
            }
            order = await Order.findOne({ payment: payment._id });
            if (!order) {
                throw error;
            }
        }
    }

    if (!payment.order || !payment.order.equals(order._id)) {
        payment.order = order._id;
        await payment.save();
    }

    return order;
};
