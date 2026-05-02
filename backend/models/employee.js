const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    phone: { type: String, required: true },
    email: String,
    relationship: { type: String, required: true },
});

const Referencechema = new mongoose.Schema({
    firstName:    { type: String, required: true },
    lastName:     { type: String, required: true },
    middleName:   String,
    phone:        String,
    email:        String,
    relationship: { type: String, required: true }
    });


const EmployeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    //===== The Name Section for Employee =====
    firstName:     { type: String, required: true },
    lastName:      { type: String, required: true },
    middleName:    String,
    preferredName: String,
    profilePicture: String,   // S3's URL
    email:         { type: String, required: true },
    ssn:           String,
    dateOfBirth:   Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'no_answer', 'other', 'prefer not to say'],
    },
    //===== The Address Section for Employee =====
    address: {
    building: String,
    street:   String,
    city:     String,
    state:    String,
    zip:      String
  },
    //===== The contact Section for Employee =====
    cellPhone: String,
    phone: String,
    workPhone: String,

    isUSResident: { type: Boolean },

    residentType: {
    type: String,
    enum: ['Green Card', 'Citizen']
  },
    visaType: {
        type: String,
        enum: ['H1-B', 'L2', 'F1', 'OPT', 'F1(CPT/OPT)', 'H4', 'Other']
    },
    workAuthorization: String,

    // ── The Visa Section for Employee ────────────────────  
    visaTitle: String,
    visaStart: Date,
    visaEnd:   Date,
    visaStartDate: Date,
    visaEndDate: Date,

    emergencyContacts: [EmergencyContactSchema], // at least 1 emergContact

    onboardingStatus: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
    },
    onboardingfeedback: String // Not sure if we want this. 
}, { timestamps: true }); // auto create CreatedAt and UpdatedAt

module.exports = mongoose.model('Employee', EmployeeSchema);
    
