const express = require('express');
const router = express.Router();
const { stkPush, stkCallback, paymentStatus } = require('../controllers/mpesaController');
const generateToken = require('../middleware/mpesaMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/stkpush', protect, authorize('customer'), generateToken, stkPush);
router.get('/status/:paymentId', protect, authorize('customer'), generateToken, paymentStatus);
router.post('/callback', stkCallback);

module.exports = router;