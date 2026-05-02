require("dotenv").config();

const mongoose = require("mongoose");
const Onboarding = require("../models/Onboarding");
const Employee = require("../models/employee");
const VisaStatus = require("../models/VisaStatus");

const VISA_DOCUMENT_ORDER = ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"];
const OPT_WORK_AUTHORIZATIONS = ["OPT", "F1", "F1(CPT/OPT)"];

const isOptWorkAuthorization = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  return OPT_WORK_AUTHORIZATIONS.some(
    (option) => normalized === option || normalized.includes(option)
  );
};

const getOnboardingDocumentList = (documents = {}) => {
  if (Array.isArray(documents)) {
    return documents;
  }

  return [
    documents.profilePicture && { name: "profilePicture", ...documents.profilePicture },
    documents.driverLicense && { name: "driverLicense", ...documents.driverLicense },
    documents.workAuthorization && {
      name: "OPT_RECEIPT",
      ...documents.workAuthorization,
    },
  ].filter((document) => document?.url || document?.fileUrl);
};

const getOptReceiptDocument = (documents = {}) =>
  getOnboardingDocumentList(documents).find((document) => {
    const name = String(document?.name || document?.documentType || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    return name === "OPT_RECEIPT" || name.includes("OPT_RECEIPT");
  });

const buildVisaWorkflowDocuments = (optReceiptDocument) =>
  VISA_DOCUMENT_ORDER.map((documentType) => {
    const fileUrl = optReceiptDocument?.fileUrl || optReceiptDocument?.url;
    const document = {
      documentType,
      status: "not_uploaded",
      fileUrl: "",
      feedback: "",
    };

    if (documentType === "OPT_RECEIPT" && fileUrl) {
      document.status = "pending";
      document.fileUrl = fileUrl;
      document.s3Key = optReceiptDocument.s3Key;
      document.fileName = optReceiptDocument.name || "OPT Receipt";
    }

    return document;
  });

const getMobilePhone = (phone) =>
  typeof phone === "string" ? phone : phone?.mobile || "";

const getWorkPhone = (phone) =>
  typeof phone === "string" ? "" : phone?.work || "";

const toEmployeeUpdate = (onboarding) => ({
  user: onboarding.user,
  userId: onboarding.user,
  // Backfill mirrors approved onboarding into the Employee profile.
  firstName: onboarding.firstName,
  lastName: onboarding.lastName,
  middleName: onboarding.middleName,
  preferredName: onboarding.preferredName,
  email: onboarding.email,
  ssn: onboarding.personalInfo?.ssn,
  dateOfBirth: onboarding.personalInfo?.dateOfBirth,
  gender: onboarding.personalInfo?.gender,
  phone: getMobilePhone(onboarding.phone),
  cellPhone: getMobilePhone(onboarding.phone),
  workPhone: getWorkPhone(onboarding.phone),
  address: {
    building: onboarding.address?.building,
    street: onboarding.address?.street,
    city: onboarding.address?.city,
    state: onboarding.address?.state,
    zip: onboarding.address?.zip,
  },
  workAuthorization: onboarding.workAuthorization,
  visaType: onboarding.workAuthorization,
  visaStartDate: onboarding.visaStartDate,
  visaEndDate: onboarding.visaEndDate,
  visaStart: onboarding.visaStartDate,
  visaEnd: onboarding.visaEndDate,
  emergencyContacts: onboarding.emergencyContacts,
  onboardingStatus: "approved",
  onboardingfeedback: "",
});

const backfill = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const onboardings = await Onboarding.find({ status: "approved" });
  let employeeCount = 0;
  let visaCount = 0;

  for (const onboarding of onboardings) {
    const session = await mongoose.startSession();

    try {
      // Each onboarding is repaired atomically to avoid profile/visa drift.
      await session.withTransaction(async () => {
        await Employee.findOneAndUpdate(
          { userId: onboarding.user },
          { $set: toEmployeeUpdate(onboarding) },
          { new: true, upsert: true, session, setDefaultsOnInsert: true }
        );
        employeeCount += 1;

        if (isOptWorkAuthorization(onboarding.workAuthorization)) {
          const optReceiptDocument = getOptReceiptDocument(onboarding.documents);

          // VisaStatus.documents becomes the only visa workflow source.
          await VisaStatus.findOneAndUpdate(
            { employee: onboarding.user },
            {
              $set: {
                employee: onboarding.user,
                onboarding: onboarding._id,
                workAuthorization: onboarding.workAuthorization,
                visaStartDate: onboarding.visaStartDate,
                visaEndDate: onboarding.visaEndDate,
                documents: buildVisaWorkflowDocuments(optReceiptDocument),
              },
            },
            { new: true, upsert: true, runValidators: true, session }
          );
          visaCount += 1;
        }
      });
    } finally {
      await session.endSession();
    }
  }

  console.log(
    `Backfilled ${employeeCount} Employee profiles and ${visaCount} VisaStatus records.`
  );

  await mongoose.disconnect();
};

backfill().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
