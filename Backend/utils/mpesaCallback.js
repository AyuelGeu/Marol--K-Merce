const buildAuthenticatedCallbackUrl = (baseUrl, token) => {
    if (typeof token !== 'string' || Buffer.byteLength(token, 'utf8') < 32) {
        throw new Error('MPESA_CALLBACK_TOKEN must be at least 32 characters.');
    }

    const callbackUrl = new URL(baseUrl);
    if (callbackUrl.protocol !== 'https:') {
        throw new Error('MPESA_CALLBACK_URL must use HTTPS.');
    }

    callbackUrl.pathname = `${callbackUrl.pathname.replace(/\/+$/, '')}/${token}`;
    return callbackUrl.toString();
};

module.exports = buildAuthenticatedCallbackUrl;
