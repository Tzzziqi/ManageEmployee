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
      type: String,
    },

    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },

    workAuthorization: {
      type: String,
      enum: ["H1-B", "L2", "F1", "H4", "Other"],
    },

    visaStartDate: Date,
    visaEndDate: Date,

    documents: [
      {
        name: String,
        url: String,
      },
    ],

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

module.exports = mongoose.model(
  "OnboardingApplication",
  onboardingSchema
);