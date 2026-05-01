const mongoose = require("mongoose");

const visaDocumentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"],
      required: true,
    },
    fileName: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["not_started", "pending", "approved", "rejected"],
      default: "not_started",
    },
    feedback: {
      type: String,
      default: "",
    },
    uploadedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const visaStatusSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    onboarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Onboarding",
      required: true,
    },
    workAuthorization: {
      type: String,
      default: "F1",
    },
    visaStartDate: {
      type: Date,
    },
    visaEndDate: {
      type: Date,
    },
    documents: {
      type: [visaDocumentSchema],
      default: [
        { documentType: "OPT_RECEIPT", status: "not_started" },
        { documentType: "OPT_EAD", status: "not_started" },
        { documentType: "I_983", status: "not_started" },
        { documentType: "I_20", status: "not_started" },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisaStatus", visaStatusSchema);
