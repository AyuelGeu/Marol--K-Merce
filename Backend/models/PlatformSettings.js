const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        enum: ['platform'],
        default: 'platform',
        unique: true
    },
    dailyCommissionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    payoutPhoneNumber: {
        type: String,
        trim: true,
        default: ''
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
