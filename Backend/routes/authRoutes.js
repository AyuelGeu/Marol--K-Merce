// routes/authRoutes.js
const express = require('express');
const router = express.Router();
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

// Protected Route Example (Middleware applied)
router.get('/dashboard', protect, (req, res) => {
    // This route only runs if the 'protect' middleware calls next()
    res.json({ message: `Welcome to the dashboard, instructor ${req.user.id}` });
});

module.exports = router;