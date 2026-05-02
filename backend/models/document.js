// Documnet.js to track who's docs belong to who and the status, location and type

const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    type: {
        type: String,
        enum: ['PROFILE_PIC', 'DRIVERS_LICENSE', 'WORK_AUTH', 'OPT_RECEIPT', 'OPT_EAD','I983', 'I20'],
        required: true
    },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    feedback: String,

    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
