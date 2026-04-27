const mongoose = require('mongoose');


const RegistrationTokenSchema = new mongoose.Schema({
    inviteToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['Employee', 'HR'],
        default: 'Employee'
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'used', 'revoked'],
        default: 'pending'
    },
    expirationDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RegistrationToken', RegistrationTokenSchema);