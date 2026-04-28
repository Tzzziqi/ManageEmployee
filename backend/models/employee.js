// MyEmployee Form
const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    phone: { type: String, required: true },
    email: String,
    relationship: { type: String, required: true },
});

const ReferneceSchema = new mongoose.Schema({
    firstName:    { type: String, required: true },
    lastName:     { type: String, required: true },
    middleName:   String,
    phone:        String,
    email:        String,
    relationship: { type: String, required: true }
    });


const EmployeeSchema = new mongoose.Schema({
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
    ssn:           { type: String, required: true },
    dateOfBirth:   { type: Date, required: true },
    gender: {
        type: String,
        enum: ['male', 'female', 'no_answer'],
        required: true
    },
    //===== The Address Section for Employee =====
    address: {
    building: String,
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    zip:      { type: String, required: true }
  },
    //===== The contact Section for Employee =====
    cellPhone: { type: String, required: true },
    workPhone: String,

    isUSResident: { type: Boolean },

    residentType: {
    type: String,
    enum: ['Green Card', 'Citizen']
  },
    visaType: {
        type: String,
        enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other']
    },

    // ── The Visa Section for Employee ────────────────────  
    visaTitle: String,
    visaStart: Date,
    visaEnd:   Date,

    emergencyContacts: [EmergencyContactSchema], // at least 1 emergContact

    onboardingStatus: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted'
    },
    onboardingGeedback: String // Not sure if we want this. 
}, { timestamps: true }); // auto create CreatedAt and UpdatedAt

module.exports = mongoose.model('Employee', EmployeeSchema);
    