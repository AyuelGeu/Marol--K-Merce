const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        default: 'New User'
    },
    userName: {
        type: String,
        default: 'New User'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    profilePictureSource: {
        type: String,
        enum: ['', 'google', 'upload'],
        default: ''
    },
    // Defines access control for Admin, Vendor, or Customer dashboards
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer',
        required: true
    },
    // Vendor-specific fields (Admins can toggle isApproved)
    vendorProfile: {
        storeName: { 
            type: String, 
            trim: true 
        },
        pendingStoreName: {
            type: String,
            trim: true,
            default: ''
        },
        storeNameStatus: {
            type: String,
            enum: ['not_submitted', 'pending', 'approved', 'rejected'],
            default: 'not_submitted'
        },
        storeDescription: { 
            type: String 
        },
        isApproved: { 
            type: Boolean, 
            default: false 
        }
    },
    vendorApplication: {
        storeName: {
            type: String,
            trim: true,
            maxlength: 100
        },
        storeDescription: {
            type: String,
            trim: true,
            maxlength: 500
        },
        contactNumber: {
            type: String,
            trim: true,
            maxlength: 20
        },
        storeAddress: {
            type: String,
            trim: true,
            maxlength: 200
        },
        storeCategory: {
            type: String,
            trim: true,
            maxlength: 100
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: undefined,
                validate: {
                    validator: (coordinates) => (
                        !coordinates || coordinates.length === 0 || coordinates.length === 2
                    ),
                    message: 'Location coordinates must contain longitude and latitude'
                }
            }
        },
        status: {
            type: String,
            enum: ['pending', 'approved'],
            default: undefined
        },
        submittedAt: Date
    },
    // Customer shipping addresses
    addresses: [{
        street: String,
        city: String,
        postalCode: String,
        country: String,
        isDefault: { 
            type: Boolean, 
            default: false 
        }
    }],
    // OTP fields maintained for Nodemailer integration
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // NEW: Password reset fields directly inside the schema
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    resetPasswordTokens: {
        type: [{
            tokenHash: String,
            expiresAt: Date
        }],
        default: []
    }

}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);