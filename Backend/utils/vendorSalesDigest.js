const Order = require('../models/Order');
const Product = require('../models/Product');
const Staff = require('../models/Users');
const { sendVendorDailySalesEmail } = require('./sendEmail');

const timeZone = 'Africa/Nairobi';
const sendHour = 21;
const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
});
const dateLabelFormatter = new Intl.DateTimeFormat('en-KE', {
    timeZone,
    dateStyle: 'long'
});
const runDateFormatter = new Intl.DateTimeFormat('en-KE', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short'
});

const getZonedParts = (date) => {
    const parts = Object.fromEntries(
        dateTimeFormatter.formatToParts(date).map(({ type, value }) => [type, value])
    );
    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second)
    };
};

const getTimeZoneOffsetMinutes = (date) => {
    const parts = getZonedParts(date);
    const localDateAsUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
    );
    return Math.round((localDateAsUtc - date.getTime()) / 60000);
};

const localDateToUtc = (year, month, day, hour = 0) => {
    const referenceDate = new Date(Date.UTC(year, month - 1, day, 12));
    const offsetMinutes = getTimeZoneOffsetMinutes(referenceDate);
    return new Date(Date.UTC(year, month - 1, day, hour) - offsetMinutes * 60000);
};

const getNextCalendarDate = ({ year, month, day }) => {
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    return {
        year: nextDate.getUTCFullYear(),
        month: nextDate.getUTCMonth() + 1,
        day: nextDate.getUTCDate()
    };
};

const getNairobiDayWindow = (now = new Date()) => {
    const today = getZonedParts(now);
    const tomorrow = getNextCalendarDate(today);
    return {
        start: localDateToUtc(today.year, today.month, today.day),
        end: localDateToUtc(tomorrow.year, tomorrow.month, tomorrow.day),
        dateLabel: dateLabelFormatter.format(now)
    };
};

const getNextRunAt = (now = new Date()) => {
    let localDate = getZonedParts(now);
    let nextRun = localDateToUtc(localDate.year, localDate.month, localDate.day, sendHour);

    if (nextRun <= now) {
        localDate = getNextCalendarDate(localDate);
        nextRun = localDateToUtc(localDate.year, localDate.month, localDate.day, sendHour);
    }

    return nextRun;
};

const sendDailyVendorSalesSummary = async () => {
    const window = getNairobiDayWindow();
    const vendors = await Staff.find({ role: 'vendor' })
        .select('_id name email vendorProfile.storeName')
        .lean();

    if (vendors.length === 0) {
        console.info('[Vendor sales digest] No vendor accounts found.');
        return;
    }

    const vendorIds = vendors.map((vendor) => vendor._id);
    const [orders, products] = await Promise.all([
        Order.find({
            createdAt: { $gte: window.start, $lt: window.end },
            status: { $ne: 'cancelled' },
            'items.vendor': { $in: vendorIds }
        }).select('items').lean(),
        Product.find({ vendor: { $in: vendorIds } })
            .select('vendor name inventory')
            .lean()
    ]);

    const reports = new Map(vendors.map((vendor) => [
        vendor._id.toString(),
        {
            vendor,
            totalSales: 0,
            unitsSold: 0,
            orderIds: new Set(),
            products: new Map()
        }
    ]));

    products.forEach((product) => {
        const report = reports.get(product.vendor.toString());
        if (!report) return;
        report.products.set(product._id.toString(), {
            productName: product.name,
            unitsSold: 0,
            sales: 0,
            remainingStock: product.inventory
        });
    });

    orders.forEach((order) => {
        order.items.forEach((item) => {
            const report = reports.get(item.vendor.toString());
            if (!report) return;

            const quantity = Number(item.quantity);
            const lineSales = Number(item.unitPrice) * quantity;
            if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(lineSales)) return;

            const productId = item.product.toString();
            let product = report.products.get(productId);
            if (!product) {
                product = {
                    productName: item.productName || 'Product',
                    unitsSold: 0,
                    sales: 0,
                    remainingStock: null
                };
                report.products.set(productId, product);
            }
            product.unitsSold += quantity;
            product.sales += lineSales;
            report.unitsSold += quantity;
            report.totalSales += lineSales;
            report.orderIds.add(order._id.toString());
        });
    });

    for (const report of reports.values()) {
        const { vendor } = report;
        if (!vendor.email) {
            console.error(`[Vendor sales digest] Vendor ${vendor._id} has no email address.`);
            continue;
        }

        const summary = {
            vendorName: vendor.name || 'Vendor',
            storeName: vendor.vendorProfile?.storeName || 'Your store',
            dateLabel: window.dateLabel,
            totalSales: report.totalSales,
            unitsSold: report.unitsSold,
            orderCount: report.orderIds.size,
            products: [...report.products.values()].sort((first, second) =>
                first.productName.localeCompare(second.productName)
            )
        };

        try {
            await sendVendorDailySalesEmail(vendor.email, summary);
            console.info(`[Vendor sales digest] Email sent for vendor ${vendor._id}.`);
        } catch (error) {
            console.error(`[Vendor sales digest] Unable to email vendor ${vendor._id}:`, error);
        }
    }
};

const scheduleNextDigest = () => {
    const nextRun = getNextRunAt();
    const delay = Math.max(0, nextRun.getTime() - Date.now());
    setTimeout(async () => {
        try {
            await sendDailyVendorSalesSummary();
        } catch (error) {
            console.error('[Vendor sales digest] Daily summary failed:', error);
        } finally {
            scheduleNextDigest();
        }
    }, delay);
    console.info(`[Vendor sales digest] Next email scheduled for ${runDateFormatter.format(nextRun)}.`);
};

module.exports = scheduleNextDigest;
module.exports.getNairobiDayWindow = getNairobiDayWindow;
module.exports.getNextRunAt = getNextRunAt;
module.exports.sendDailyVendorSalesSummary = sendDailyVendorSalesSummary;
