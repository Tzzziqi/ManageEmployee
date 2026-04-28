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
        enum: ['Profile_Pic', 'Drivers_License', 'Work_Auth', 'Opt_Receipt', 'OPT_EDA','I983', '-20'],
        required: true
    },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    feedback: String,

    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
