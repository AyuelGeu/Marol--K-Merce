// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerStaff, loginStaff } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes (No middleware needed)
router.post('/register', registerStaff);
router.post('/login', loginStaff);

// Protected Route Example (Middleware applied)
router.get('/dashboard', protect, (req, res) => {
    // This route only runs if the 'protect' middleware calls next()
    res.json({ message: `Welcome to the dashboard, instructor ${req.user.id}` });
});

module.exports = router;