// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { registerStaff, loginStaff, verifyOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes (No middleware needed)
router.post('/register', registerStaff);
router.post('/login', loginStaff);
router.post('/verify-otp', verifyOTP);

// NEW: Logout route to destroy the session cookie and fix the 404 error
router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to destroy session' });
            }
            // 'connect.sid' is the default name for express-session cookies
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Successfully logged out' });
        });
    } else {
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
    }
});
//Admin-Only Routes
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await Staff.find().select('-password -otp -otpExpiry'); // Exclude sensitive fields
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

//Admin & Vendor Shared Routes
router.get('/shared-data', protect, authorize(['admin', 'vendor']), async (req, res) => {
    res.json({ message: 'This data is accessible to both Admins and Vendors.' });
});

//Customer, Admin, and Vendor Shared Routes
router.get('/customer-data', protect, authorize(['customer', 'admin', 'vendor']), async (req, res) => {
    res.json({ message: 'This data is accessible to Customers, Admins, and Vendors.' });
});

// Protected Route Example (Middleware applied)


module.exports = router;