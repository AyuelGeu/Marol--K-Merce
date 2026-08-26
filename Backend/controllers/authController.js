// controllers/authController.js
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registration Controller
exports.registerStaff = async(req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const userExists = await Staff.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password for production security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new staff member
        const newStaff = new Staff({
            email,
            password: hashedPassword,
            name: name || 'New User',
            department: 'Data Annotation',
            role: 'instructor'
        });

        await newStaff.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error in register route:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login Controller
exports.loginStaff = async(req, res) => {
    try {
        const { email, password } = req.body;

        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT Token
        const token = jwt.sign({ id: staff._id, role: staff.role },
            process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            staff: { id: staff._id, email: staff.email, role: staff.role }
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};