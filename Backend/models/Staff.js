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
    }
});

module.exports = mongoose.model('Staff', staffschema);