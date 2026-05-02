const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    preferredName: {
      type: String,
    },

    email: {
      type: String,
      required: true,
    },
    phone: {
      mobile: String,
      work: String,
    },

    personalInfo: {
      dateOfBirth: Date,
      gender: String,
      ssn: String,
    },

    address: {
      building: String,
      street: String,
      city: String,
      state: String,
      zip: String,
    },

    workAuthorization: {
      type: String,
      enum: ["H1-B", "L2", "F1", "OPT", "F1(CPT/OPT)", "H4", "Other"],
    },

    workAuthorizationDetail: {
      isCitizenOrPR: String,
      citizenType: String,
      workAuthType: String,
      otherVisaTitle: String,
      startDate: Date,
      endDate: Date,
    },

    visaStartDate: Date,
    visaEndDate: Date,

    reference: {
      firstName: String,
      lastName: String,
      middleName: String,
      relationship: String,
      phone: String,
      email: String,
    },

    emergencyContacts: [
      {
        firstName: String,
        lastName: String,
        middleName: String,
        relationship: String,
        phone: String,
        email: String,
      },
    ],

    documents: {
      profilePicture: {
        url: String,
        s3Key: String,
        uploadedAt: Date,
      },
      workAuthorization: {
        url: String,
        s3Key: String,
        uploadedAt: Date,
      },
      driverLicense: {
        url: String,
        s3Key: String,
        uploadedAt: Date,
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Onboarding", onboardingSchema);
