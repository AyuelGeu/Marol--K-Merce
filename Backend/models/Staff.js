const mongoose = require('mongoose');

const staffschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'New user'
    },
    department:{
        type: String,
        default: 'Unassigned'
    },
    role: {
        type: String,
        default: 'Student'
    },
    checkedin: {
        type: Boolean,
        default: false
    },
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
    }
});

module.exports = mongoose.model('Staff', staffschema);