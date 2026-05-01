const VisaStatus = require("../models/VisaStatus");
const sendEmail = require("../utils/sendEmail");

const DOCUMENT_ORDER = ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"];
const DOCUMENT_LABELS = {
  OPT_RECEIPT: "OPT Receipt",
  OPT_EAD: "OPT EAD",
  I_983: "I-983",
  I_20: "I-20",
};
const LEGACY_DOCUMENT_TYPES = {
  I983: "I_983",
  I20: "I_20",
  OPT_EDA: "OPT_EAD",
  "-20": "I_20",
};
const REMINDER_DELAY_MS = 3 * 24 * 60 * 60 * 1000;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeLegacyDocumentStatuses = (documents) => {
  documents.forEach((document) => {
    document.documentType = LEGACY_DOCUMENT_TYPES[document.documentType] || document.documentType;

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

const getDaysRemaining = (endDate) => {
  if (!endDate) {
    return null;
  }

  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
};

const getNextStep = (documents) => {
  return DOCUMENT_ORDER.map((documentType) =>
    documents.find((document) => document.documentType === documentType) || {
      documentType,
      status: "not_started",
    }
  ).find((document) => document.status !== "approved") || null;
};

const getWorkflowAction = (nextStep, previousStep) => {
  if (!nextStep) {
    return { type: "complete", label: "Complete" };
  }

  if (nextStep.status === "pending") {
    return { type: "review", label: "Review Document" };
  }

  return {
    type: "notify",
    label: "Send Notification",
    canSendNotification: canSendReminder(previousStep, nextStep),
  };
};

const toVisaViewModel = (visa) => {
  normalizeLegacyDocumentStatuses(visa.documents);

  const documents = DOCUMENT_ORDER.map((documentType) => {
    const document = visa.documents.find((item) => item.documentType === documentType);
    return document || { documentType, status: "not_started" };
  });
  const nextStep = getNextStep(documents);
  const nextStepIndex = nextStep ? DOCUMENT_ORDER.indexOf(nextStep.documentType) : -1;
  const previousStep =
    nextStepIndex > 0
      ? documents.find((document) => document.documentType === DOCUMENT_ORDER[nextStepIndex - 1])
      : null;
  const visaStartDate = visa.visaStartDate || visa.onboarding?.visaStartDate;
  const visaEndDate = visa.visaEndDate || visa.onboarding?.visaEndDate;

  return {
    _id: visa._id,
    employee: visa.employee,
    onboarding: visa.onboarding,
    workAuthorization: visa.workAuthorization || visa.onboarding?.workAuthorization || "N/A",
    visaStartDate,
    visaEndDate,
    daysRemaining: getDaysRemaining(visaEndDate),
    documents,
    approvedDocuments: documents.filter(
      (document) => document.status === "approved" && document.fileUrl
    ),
    nextStep,
    action: getWorkflowAction(nextStep, previousStep),
  };
};

const matchesVisaSearch = (visa, keyword) => {
  if (!keyword) {
    return true;
  }

  const regex = new RegExp(escapeRegex(keyword), "i");
  return [
    visa.employee?.username,
    visa.employee?.email,
    visa.onboarding?.firstName,
    visa.onboarding?.lastName,
    visa.onboarding?.preferredName,
    visa.onboarding?.email,
  ].some((value) => value && regex.test(value));
};

const getInProgressVisaEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const keyword = (req.query.keyword || "").trim();

    const filter = {
      documents: {
        $elemMatch: {
          status: { $in: ["not_started", "not_uploaded", "pending", "rejected"] },
        },
      },
    };

    const records = await VisaStatus.find(filter)
      .populate("employee", "username email")
      .populate("onboarding")
      .sort({ updatedAt: -1 });

    const filteredRecords = records.filter((visa) => matchesVisaSearch(visa, keyword));
    const employees = filteredRecords.slice(skip, skip + limit).map(toVisaViewModel);

    res.status(200).json({
      employees,
      page,
      totalPages: Math.ceil(filteredRecords.length / limit),
      total: filteredRecords.length,
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
    const keyword = (req.query.keyword || "").trim();

    const records = await VisaStatus.find()
      .populate("employee", "username email")
      .populate("onboarding")
      .sort({ updatedAt: -1 });

    const filteredRecords = records.filter((visa) => matchesVisaSearch(visa, keyword));
    const employees = filteredRecords.slice(skip, skip + limit).map(toVisaViewModel);

    res.status(200).json({
      employees,
      page,
      totalPages: Math.ceil(filteredRecords.length / limit),
      total: filteredRecords.length,
    });
  } catch (error) {
    console.error("Failed to get all visa statuses:", error);

    res.status(500).json({
      message: "Failed to get all visa statuses",
      error: error.message,
    });
  }
};

const getVisaStatusById = async (req, res) => {
  try {
    const visa = await VisaStatus.findById(req.params.id)
      .populate("employee", "username email")
      .populate("onboarding");

    if (!visa) {
      return res.status(404).json({ message: "Visa record not found" });
    }

    res.status(200).json({
      visa: toVisaViewModel(visa),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get visa status",
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

    normalizeLegacyDocumentStatuses(visa.documents);

    const doc = visa.documents.find(
      (d) => d.documentType === documentType
    );

    if (!doc) {
      return res.status(400).json({ message: "Document not found" });
    }

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

const sendNextStepNotificationEmail = async (req, res) => {
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

    const index = DOCUMENT_ORDER.indexOf(documentType);

    if (index < 0 || index === DOCUMENT_ORDER.length - 1) {
      return res.status(400).json({
        message: "No next step available",
      });
    }

    const currentStep = visa.documents.find(
      (document) => document.documentType === documentType
    );

    if (currentStep?.status !== "approved") {
      return res.status(400).json({
        message: "Current step must be approved before sending notification",
      });
    }

    const employeeEmail = visa.employee?.email;

    if (!employeeEmail) {
      return res.status(400).json({
        message: "Employee email not found",
      });
    }

    const nextDocumentType = DOCUMENT_ORDER[index + 1];

    await sendEmail({
      to: employeeEmail,
      subject: `Your ${DOCUMENT_LABELS[documentType]} has been approved`,
      text: `Your current state (${DOCUMENT_LABELS[documentType]}) has been approved.
Please upload the next step, ${DOCUMENT_LABELS[nextDocumentType]} required document.`,
    });

    res.status(200).json({
      message: "Notification email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send notification email",
      error: error.message,
    });
  }
};

module.exports = {
  getInProgressVisaEmployees,
  getAllVisaStatuses,
  getVisaStatusById,
  approveVisaDocument,
  rejectVisaDocument,
  sendReminderEmail,
  sendNextStepNotificationEmail,
};
