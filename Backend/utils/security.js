const crypto = require('crypto');

const getRequiredSecret = (name) => {
    const secret = process.env[name];
    if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error(`${name} must be configured with at least 32 characters.`);
    }
    return secret;
};

const tokensMatch = (provided, expected) => {
    if (typeof provided !== 'string' || typeof expected !== 'string' || !provided || !expected) {
        return false;
    }
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);
    return providedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

module.exports = { getRequiredSecret, tokensMatch };
