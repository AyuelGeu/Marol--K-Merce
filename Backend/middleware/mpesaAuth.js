const axios = require('axios');
require('dotenv').config();

const generateToken = async (req, res, next) => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    // Create base64 encoded string from key and secret
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        // Attach token to the request object
        req.mpesaToken = response.data.access_token;
        next();
    } catch (error) {
        console.error("Token error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate M-Pesa token' });
    }
};

module.exports = { generateToken };