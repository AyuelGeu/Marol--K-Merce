const axios = require('axios');

let cachedAccessToken = '';
let accessTokenExpiresAt = 0;

const getMpesaBaseUrl = () => (
  process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'
);

const generateToken = async (req, res, next) => {
  if (cachedAccessToken && accessTokenExpiresAt > Date.now() + 30000) {
    req.mpesaToken = cachedAccessToken;
    req.mpesaBaseUrl = getMpesaBaseUrl();
    return next();
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    console.error('M-Pesa consumer credentials are not configured.');
    return res.status(503).json({ error: 'M-Pesa payments are not configured.' });
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  try {
    const response = await axios.get(
      `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    if (!response.data?.access_token) {
      throw new Error('M-Pesa token response did not include an access token.');
    }

    cachedAccessToken = response.data.access_token;
    accessTokenExpiresAt = Date.now() + Number(response.data.expires_in || 3600) * 1000;
    req.mpesaToken = cachedAccessToken;
    req.mpesaBaseUrl = getMpesaBaseUrl();
    return next();
  } catch (error) {
    console.error('M-Pesa token error:', error.response?.data || error.message);
    return res.status(502).json({ error: 'Unable to connect to M-Pesa. Please try again.' });
  }
};

module.exports = generateToken;
