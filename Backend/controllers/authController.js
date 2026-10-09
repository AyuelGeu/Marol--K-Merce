// controllers/authController.js
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const supportedRoles = new Set(Staff.schema.path('role').enumValues);

// Registration Controller
// controllers/authController.js

exports.registerStaff = async(req, res) => {
    try {
        // 1. Only extract email, password, and name
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const userExists = await Staff.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOTP();

        // 2. Remove the "assignedRole" fallback logic completely.

        // 3. Create the new staff member with a hardcoded 'customer' role
        const newStaff = new Staff({
            email,
            password: hashedPassword,
            name: name || 'New User',
            role: 'customer', // HARDCODED TO CUSTOMER
            otp: otp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });

        await newStaff.save();

        if (process.env.NODE_ENV !== 'test') {
            await sendOTPEmail(email, otp);
        }

        res.status(201).json({
            message: 'Registration successful. Please verify your OTP.',
            requiresOTP: true,
            email: newStaff.email
        });
    } catch (error) {
        console.error('Error in register route:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login Controller
exports.loginStaff = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const staff = await Staff.findOne({ email: email.trim() });
        if (!staff) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (typeof staff.password !== 'string' || !staff.password) {
            return res.status(401).json({
                message: 'This account was created with social sign-in. Continue with your linked provider, or use Forgot Password to set a password for email sign-in.'
            });
        }

        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!supportedRoles.has(staff.role)) {
            return res.status(403).json({
                message: `This account has an unsupported role ('${staff.role}'). Ask an administrator to assign customer, vendor, or admin access.`
            });
        }

        // Generate and save new OTP
        const otp = generateOTP();
        staff.otp = otp;
        staff.otpExpiry = Date.now() + 10 * 60 * 1000;
        await staff.save();

        // Send OTP email
        if (process.env.NODE_ENV !== 'test') {
            await sendOTPEmail(staff.email, otp);
        }

        res.status(200).json({
            message: 'Credentials valid. OTP sent to email.',
            requiresOTP: true,
            email: staff.email
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// OTP Verification Controller
exports.verifyOTP = async(req, res) => {
    try {
        const { email, otp } = req.body;

        const staff = await Staff.findOne({ email });

        if (!staff || staff.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (staff.otpExpiry < Date.now()) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        if (!supportedRoles.has(staff.role)) {
            return res.status(403).json({
                error: `This account has an unsupported role ('${staff.role}'). Ask an administrator to assign customer, vendor, or admin access.`
            });
        }

        // Clear OTP and mark verified
        staff.otp = null;
        staff.otpExpiry = null;
        staff.isVerified = true;
        await staff.save();

        // NEW: Establish Layer 1 security by attaching the user ID to the session cookie[cite: 19]
        if (req.session) {
            req.session.userId = staff._id.toString();
        }

        // Generate a JWT Token (Layer 2)
        const token = jwt.sign({ id: staff._id, role: staff.role },
            process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Authentication successful',
            token,
            staff: {
                id: staff._id,
                email: staff.email,
                name: staff.name,
                userName: staff.userName,
                profilePicture: staff.profilePicture || '',
                role: staff.role,
                isVerified: staff.isVerified,
                createdAt: staff.createdAt,
                addressCount: Array.isArray(staff.addresses) ? staff.addresses.length : 0,
                vendorProfile: {
                    storeName: staff.vendorProfile?.storeName || '',
                    pendingStoreName: staff.vendorProfile?.pendingStoreName || '',
                    storeNameStatus: staff.vendorProfile?.storeNameStatus || 'not_submitted',
                    isApproved: staff.vendorProfile?.isApproved || false
                }
            }
        });
    } catch (error) {
        console.error('Error in verify route:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }            
};

exports.updateProfilePicture = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Choose an image to upload' });
    }

    const previousPicture = req.user.profilePicture;
    const profilePicture = `/uploads/${req.file.filename}`;

    try {
        req.user.profilePicture = profilePicture;
        await req.user.save();
    } catch (error) {
        try {
            await fs.unlink(req.file.path);
        } catch (cleanupError) {
            console.error('Unable to remove an unsuccessful profile picture upload:', cleanupError);
        }
        console.error('Error updating profile picture:', error);
        return res.status(500).json({ message: 'Unable to update profile picture' });
    }

    if (typeof previousPicture === 'string' && /^\/uploads\/[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(previousPicture)) {
        try {
            await fs.unlink(path.join(__dirname, '..', 'uploads', path.basename(previousPicture)));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Unable to remove the replaced profile picture:', error);
            }
        }
    }

    return res.status(200).json({
        message: 'Profile picture updated',
        profilePicture
    });
};

exports.updateVendorStoreName = async (req, res) => {
    if (typeof req.body.storeName !== 'string' || !req.body.storeName.trim()) {
        return res.status(400).json({ message: 'Store name is required' });
    }

    const storeName = req.body.storeName.trim();
    if (storeName.length > 100) {
        return res.status(400).json({ message: 'Store name must be 100 characters or fewer' });
    }

    try {
        const vendor = await Staff.findOneAndUpdate(
            {
                _id: req.user._id,
                role: 'vendor',
                'vendorProfile.storeNameStatus': { $nin: ['pending', 'approved'] },
                'vendorProfile.storeName': { $in: ['', null] }
            },
            {
                $set: {
                    'vendorProfile.pendingStoreName': storeName,
                    'vendorProfile.storeNameStatus': 'pending'
                }
            },
            { new: true, runValidators: true }
        );

        if (!vendor) {
            const currentVendor = await Staff.findById(req.user._id).select('vendorProfile');
            if (!currentVendor) {
                return res.status(404).json({ message: 'Vendor account was not found' });
            }

            if (currentVendor.vendorProfile?.storeNameStatus === 'approved' ||
                currentVendor.vendorProfile?.storeName) {
                return res.status(409).json({
                    message: 'Your approved store is permanent. Vendors can only have one store.'
                });
            }

            if (currentVendor.vendorProfile?.storeNameStatus === 'pending') {
                return res.status(409).json({
                    message: 'Your store name is already awaiting administrator approval.'
                });
            }

            return res.status(409).json({
                message: 'The store name could not be submitted. Refresh your dashboard and try again.'
            });
        }

        return res.status(200).json({
            message: 'Store name submitted for admin approval',
            pendingStoreName: storeName,
            storeNameStatus: vendor.vendorProfile.storeNameStatus
        });
    } catch (error) {
        console.error('Error updating vendor store name:', error);
        return res.status(500).json({ message: 'Unable to update store name' });
    }
};

exports.reviewVendorStoreName = async (req, res) => {
    const { decision, storeName } = req.body;
    if (!['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ message: 'Decision must be approve or reject' });
    }
    if (typeof storeName !== 'string' || !storeName.trim()) {
        return res.status(400).json({ message: 'Store name is required for review' });
    }

    try {
        const vendor = await Staff.findOne({
            _id: req.params.vendorId,
            role: 'vendor',
            'vendorProfile.storeNameStatus': 'pending',
            'vendorProfile.pendingStoreName': storeName
        });
        if (!vendor || !vendor.vendorProfile?.pendingStoreName) {
            return res.status(404).json({ message: 'No pending store name found for this vendor' });
        }

        if (decision === 'approve') {
            vendor.set('vendorProfile.storeName', vendor.vendorProfile.pendingStoreName);
            vendor.set('vendorProfile.storeNameStatus', 'approved');
        } else {
            vendor.set('vendorProfile.storeNameStatus', 'rejected');
        }
        vendor.set('vendorProfile.pendingStoreName', '');
        await vendor.save();

        return res.status(200).json({
            message: decision === 'approve' ? 'Store name approved' : 'Store name rejected',
            vendorId: vendor._id,
            storeName: vendor.vendorProfile.storeName || '',
            pendingStoreName: '',
            storeNameStatus: vendor.vendorProfile.storeNameStatus
        });
    } catch (error) {
        console.error('Error reviewing vendor store name:', error);
        return res.status(500).json({ message: 'Unable to review vendor store name' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const frontendUrl = process.env.FRONTEND_URL || (
            process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173'
        );
        if (!frontendUrl) {
            throw new Error('FRONTEND_URL must be configured before sending password reset links');
        }

        const frontendBaseUrl = new URL(frontendUrl);
        if (!['http:', 'https:'].includes(frontendBaseUrl.protocol)) {
            throw new Error('FRONTEND_URL must use HTTP or HTTPS');
        }

        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(404).json({
                message: 'No account is registered with this email address.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const activeTokens = (staff.resetPasswordTokens || [])
            .filter((entry) => entry.expiresAt > new Date());
        staff.resetPasswordTokens = [
            ...activeTokens,
            { tokenHash, expiresAt }
        ].slice(-10);
        staff.resetPasswordToken = tokenHash;
        staff.resetPasswordExpire = expiresAt;
        await staff.save();

        const resetUrl = new URL(`/reset-password/${resetToken}`, frontendBaseUrl).toString();

        try {
            await sendPasswordResetEmail(staff.email, resetUrl);
        } catch (error) {
            staff.resetPasswordToken = undefined;
            staff.resetPasswordExpire = undefined;
            staff.resetPasswordTokens = activeTokens;
            await staff.save();
            throw error;
        }

        return res.status(200).json({
            message: 'If an account exists for that email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        return res.status(500).json({ message: 'Unable to send password reset email' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Reset token and new password are required' });
        }

        const normalizedToken = token.trim().toLowerCase();
        if (!/^[a-f0-9]{64}$/.test(normalizedToken)) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        const hashedToken = crypto.createHash('sha256').update(normalizedToken).digest('hex');
        const now = new Date();
        const staff = await Staff.findOne({
            $or: [
                {
                    resetPasswordToken: hashedToken,
                    resetPasswordExpire: { $gt: now }
                },
                {
                    resetPasswordTokens: {
                        $elemMatch: {
                            tokenHash: hashedToken,
                            expiresAt: { $gt: now }
                        }
                    }
                }
            ]
        });

        if (!staff) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        staff.password = await bcrypt.hash(password, 10);
        staff.resetPasswordToken = undefined;
        staff.resetPasswordExpire = undefined;
        staff.resetPasswordTokens = (staff.resetPasswordTokens || [])
            .filter((entry) => entry.tokenHash !== hashedToken);
        await staff.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Unable to reset password' });
    }
};