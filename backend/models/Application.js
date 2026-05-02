const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    feedback: {
        type: String,
        default: ''
    },
    applicationData: {
        firstName: String,
        lastName: String,
        middleName: String,
        preferredName: String,
        email: { type:String, required: true },
        address: {
            street: String,
            buildingNumber: String,
            city: String,
            state: String,
            zipCode: String
        },
        phone: {
            mobile: String,
            work: String
        },
        personalInfo: {
            dateOfBirth: Date,
            gender: String,
            ssn: String
        },
        workAuthorization: {
            isCitizenOrPR: String,
            citizenType: String,
            workAuthType: String,
            otherVisaTitle: String,
            startDate: Date,
            endDate: Date
        },
        reference: {
            firstName: String,
            lastName: String,
            middleName: String,
            relationship: String,
            phone: String,
            email: String
        },
        emergencyContacts: [{
            firstName: String,
            lastName: String,
            middleName: String,
            relationship: String,
            phone: String,
            email: String
        }],
        documents: {
            profilePicture: {
                url: String,
                s3Key: String,
                uploadedAt: Date
            },
            workAuthorization: {
                url: String,
                s3Key: String,
                uploadedAt: Date
            },
            driverLicense: {
                url: String,
                s3Key: String,
                uploadedAt: Date
            }
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
