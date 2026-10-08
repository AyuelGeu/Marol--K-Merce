// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const {
    registerStaff,
    loginStaff,
    verifyOTP,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        userName: req.user.userName,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
        addressCount: Array.isArray(req.user.addresses) ? req.user.addresses.length : 0,
        vendorProfile: {
            storeName: req.user.vendorProfile?.storeName || '',
            isApproved: req.user.vendorProfile?.isApproved || false
        }
    });
});
router.get('/oauth-session', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Social sign-in session is missing or expired' });
        }

        const staff = await Staff.findById(userId);
        if (!staff) {
            return res.status(401).json({ message: 'Social sign-in account was not found' });
        }

        const token = jwt.sign(
            { id: staff._id, role: staff.role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            token,
            staff: {
                id: staff._id,
                email: staff.email,
                name: staff.name,
                userName: staff.userName,
                role: staff.role,
                isVerified: staff.isVerified,
                createdAt: staff.createdAt,
                addressCount: Array.isArray(staff.addresses) ? staff.addresses.length : 0,
                vendorProfile: {
                    storeName: staff.vendorProfile?.storeName || '',
                    isApproved: staff.vendorProfile?.isApproved || false
                }
            }
        });
    } catch (error) {
        console.error('Error completing social sign-in:', error);
        return res.status(500).json({ message: 'Unable to complete social sign-in' });
    }
});
//Admin-Only Routes
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await Staff.find().select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpire -resetPasswordTokens');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

//Admin & Vendor Shared Routes
router.get('/shared-data', protect, authorize('admin', 'vendor'), async (req, res) => {
    res.json({ message: 'This data is accessible to both Admins and Vendors.' });
});

//Customer, Admin, and Vendor Shared Routes
router.get('/customer-data', protect, authorize('customer', 'admin', 'vendor'), async (req, res) => {
    res.json({ message: 'This data is accessible to Customers, Admins, and Vendors.' });
});

// Protected Route Example (Middleware applied)


module.exports = router;