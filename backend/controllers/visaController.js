const VisaStatus = require("../models/VisaStatus");
const sendEmail = require("../utils/sendEmail");

const DOCUMENT_ORDER = ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"];
const REMINDER_DELAY_MS = 3 * 24 * 60 * 60 * 1000;

const normalizeLegacyDocumentStatuses = (documents) => {
  documents.forEach((document) => {
    if (document.status === "not_uploaded") {
      document.status = "not_started";
    }
  });
};

const canSendReminder = (previousStep, currentStep) => {
  if (!previousStep?.approvedAt) {
    return false;
  }

  return (
    previousStep.status === "approved" &&
    currentStep.status === "not_started" &&
    !currentStep.fileUrl &&
    Date.now() - previousStep.approvedAt.getTime() >= REMINDER_DELAY_MS
  );
};

const getInProgressVisaEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = {
      documents: {
        $elemMatch: {
          status: { $in: ["not_started", "not_uploaded", "pending", "rejected"] },
        },
      },
    };

    const total = await VisaStatus.countDocuments(filter);

    const employees = await VisaStatus.find(filter)
      .populate("employee", "username email")
      .populate("onboarding")
      .skip(skip)
      .limit(limit);

    employees.forEach((visa) => {
      normalizeLegacyDocumentStatuses(visa.documents);
    });

    res.status(200).json({
      employees,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get visa status",
      error: error.message,
    });
  }
};

const getAllVisaStatuses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await VisaStatus.countDocuments();

    const employees = await VisaStatus.find()
      .populate("employee", "username email")
      .populate("onboarding")
      .skip(skip)
      .limit(limit);

    employees.forEach((visa) => {
      normalizeLegacyDocumentStatuses(visa.documents);
    });

    res.status(200).json({
      employees,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Failed to get all visa statuses:", error);

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

    normalizeLegacyDocumentStatuses(visa.documents);

    const index = DOCUMENT_ORDER.indexOf(documentType);

    if (index > 0) {
      const prevDoc = visa.documents.find(
        (d) => d.documentType === DOCUMENT_ORDER[index - 1]
      );

      if (prevDoc?.status !== "approved") {
        return res.status(400).json({
          message: "Previous step not approved yet",
        });
      }
    }

    doc.status = "approved";
    doc.reviewedAt = new Date();
    doc.approvedAt = new Date();
    doc.feedback = "";

    const nextDocumentType = DOCUMENT_ORDER[index + 1];
    const nextDoc = visa.documents.find(
      (d) => d.documentType === nextDocumentType
    );

    if (nextDoc && !nextDoc.fileUrl && nextDoc.status !== "pending") {
      nextDoc.status = "not_started";
    }

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

    normalizeLegacyDocumentStatuses(visa.documents);

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

const sendReminderEmail = async (req, res) => {
  try {
    const { id, documentType } = req.params;

    const visa = await VisaStatus.findById(id)
      .populate("employee", "username email")
      .populate("onboarding");

    if (!visa) {
      return res.status(404).json({
        message: "Visa record not found",
      });
    }

    normalizeLegacyDocumentStatuses(visa.documents);

    const doc = visa.documents.find(
      (document) => document.documentType === documentType
    );

    if (!doc) {
      return res.status(400).json({
        message: "Document not found",
      });
    }

    const index = DOCUMENT_ORDER.indexOf(documentType);

    if (index <= 0) {
      return res.status(400).json({
        message: "Reminder not allowed before 3-day deadline",
      });
    }

    const previousStep = visa.documents.find(
      (document) => document.documentType === DOCUMENT_ORDER[index - 1]
    );

    if (!canSendReminder(previousStep, doc)) {
      return res.status(400).json({
        message: "Reminder not allowed before 3-day deadline",
      });
    }

    const employeeEmail = visa.employee?.email;

    if (!employeeEmail) {
      return res.status(400).json({
        message: "Employee email not found",
      });
    }

    await sendEmail({
      to: employeeEmail,
      subject: `Reminder: Please upload your ${documentType}`,
      text: `Hi ${visa.employee.username},

This is a reminder to upload your ${documentType} document for visa status management.

Please log in to the myHR portal and complete this step.

Thank you,
HR Team`,
    });

    res.status(200).json({
      message: "Reminder email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reminder email",
      error: error.message,
    });
  }
};

module.exports = {
  getInProgressVisaEmployees,
  getAllVisaStatuses,
  approveVisaDocument,
  rejectVisaDocument,
  sendReminderEmail,
};
