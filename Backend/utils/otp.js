const crypto = require('crypto');

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();
const getOtpLockExpiry = (attempts, now = Date.now()) => (
    attempts >= 5 ? new Date(now + 15 * 60 * 1000) : null
);

module.exports = { generateOTP, getOtpLockExpiry };
