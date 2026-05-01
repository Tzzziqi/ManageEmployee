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
      enum: ["not_uploaded", "not_started", "pending", "approved", "rejected"],
      default: "not_uploaded",
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
      unique: true,
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
        { documentType: "OPT_RECEIPT", status: "not_uploaded", fileUrl: "", feedback: "" },
        { documentType: "OPT_EAD", status: "not_uploaded", fileUrl: "", feedback: "" },
        { documentType: "I_983", status: "not_uploaded", fileUrl: "", feedback: "" },
        { documentType: "I_20", status: "not_uploaded", fileUrl: "", feedback: "" },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisaStatus", visaStatusSchema);
