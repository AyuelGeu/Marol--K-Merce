const express = require('express');
const router = express.Router();
const { stkPush, stkCallback, paymentStatus } = require('../controllers/mpesaController');
const generateToken = require('../middleware/mpesaMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tokensMatch } = require('../utils/security');

const verifyCallbackToken = (req, res, next) => {
    const expectedToken = process.env.MPESA_CALLBACK_TOKEN;
    if (typeof expectedToken !== 'string' || Buffer.byteLength(expectedToken, 'utf8') < 32) {
        console.error('M-Pesa callback token is missing or too short.');
        return res.status(503).json({ error: 'M-Pesa callback authentication is not configured.' });
    }
    if (!tokensMatch(req.params.callbackToken, expectedToken)) {
        return res.status(401).json({ error: 'Invalid M-Pesa callback token.' });
    }
    return next();
};

router.post('/stkpush', protect, authorize('customer'), generateToken, stkPush);
router.get('/status/:paymentId', protect, authorize('customer'), generateToken, paymentStatus);
router.post('/callback/:callbackToken', verifyCallbackToken, stkCallback);

module.exports = router;