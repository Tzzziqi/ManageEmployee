const VisaStatus = require("../models/VisaStatus");

const getInProgressVisaEmployees = async (req, res) => {
  try {
    const employees = await VisaStatus.find({
      "documents.status": { $ne: "approved" },
    })
      .populate("employee", "username email")
      .populate("onboarding");

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get visa status",
      error: error.message,
    });
  }
};

const getAllVisaStatuses = async (req, res) => {
  try {
    const employees = await VisaStatus.find()
      .populate("employee", "username email")
      .populate("onboarding");

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get all visa statuses",
      error: error.message,
    });
  }
};

const approveVisaDocument = async (req, res) => {
  try {
    const { id, documentType } = req.params;

    const visa = await VisaStatus.findById(id);

    if (!visa) {
      return res.status(404).json({ message: "Visa record not found" });
    }

    const doc = visa.documents.find(
      (d) => d.documentType === documentType
    );

    if (!doc) {
      return res.status(400).json({ message: "Document not found" });
    }

    const order = ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"];
    const index = order.indexOf(documentType);

    if (index > 0) {
      const prevDoc = visa.documents.find(
        (d) => d.documentType === order[index - 1]
      );

      if (prevDoc.status !== "approved") {
        return res.status(400).json({
          message: "Previous step not approved yet",
        });
      }
    }

    doc.status = "approved";
    doc.reviewedAt = new Date();
    doc.feedback = "";

    await visa.save();

    res.status(200).json({
      message: "Document approved",
      visa,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve document",
      error: error.message,
    });
  }
};

const rejectVisaDocument = async (req, res) => {
  try {
    const { id, documentType } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({
        message: "Feedback is required",
      });
    }

    const visa = await VisaStatus.findById(id);

    if (!visa) {
      return res.status(404).json({ message: "Visa record not found" });
    }

    const doc = visa.documents.find(
      (d) => d.documentType === documentType
    );

    if (!doc) {
      return res.status(400).json({ message: "Document not found" });
    }

    doc.status = "rejected";
    doc.feedback = feedback;
    doc.reviewedAt = new Date();

    await visa.save();

    res.status(200).json({
      message: "Document rejected",
      visa,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject document",
      error: error.message,
    });
  }
};

module.exports = {
  getInProgressVisaEmployees,
  getAllVisaStatuses,
  approveVisaDocument,
  rejectVisaDocument,
};