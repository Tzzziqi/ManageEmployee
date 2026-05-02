const Onboarding = require('../models/Onboarding');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { generateResponse } = require('../utils/responseHandler');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const getDocumentFile = (document) => {
    if (!document) {
        return null;
    }

    const url = document.url || document.fileUrl;
    if (!url) {
        return null;
    }

    return {
        url,
        s3Key: document.s3Key,
        uploadedAt: document.uploadedAt
    };
};

const toDocumentObject = (documents = {}) => {
    if (Array.isArray(documents)) {
        const documentObject = {};

        documents.forEach((document) => {
            const file = getDocumentFile(document);
            if (!file) {
                return;
            }

            const name = String(document.name || document.documentType || "").trim();
            const normalizedName = name.toUpperCase().replace(/[\s-]+/g, "_");

            if (name === "profilePicture") {
                documentObject.profilePicture = file;
            } else if (name === "driverLicense") {
                documentObject.driverLicense = file;
            } else if (name === "workAuthorization" || normalizedName === "OPT_RECEIPT") {
                documentObject.workAuthorization = file;
            }
        });

        return documentObject;
    }

    return {
        profilePicture: getDocumentFile(documents.profilePicture) || undefined,
        workAuthorization: getDocumentFile(documents.workAuthorization) || undefined,
        driverLicense: getDocumentFile(documents.driverLicense) || undefined,
    };
};

const toWorkAuthorizationDetail = (workAuthorization, fallback = {}) => {
    if (workAuthorization && typeof workAuthorization === "object") {
        return {
            isCitizenOrPR: workAuthorization.isCitizenOrPR ?? "",
            citizenType: workAuthorization.citizenType || "",
            workAuthType: workAuthorization.workAuthType || "",
            otherVisaTitle: workAuthorization.otherVisaTitle || "",
            startDate: workAuthorization.startDate,
            endDate: workAuthorization.endDate,
        };
    }

    return {
        isCitizenOrPR: fallback.isCitizenOrPR || "",
        citizenType: fallback.citizenType || "",
        workAuthType: workAuthorization || fallback.workAuthType || "",
        otherVisaTitle: fallback.otherVisaTitle || "",
        startDate: fallback.startDate,
        endDate: fallback.endDate,
    };
};

const toPhoneObject = (phone) => {
    if (!phone) {
        return { mobile: "", work: "" };
    }

    if (typeof phone === "string") {
        return { mobile: phone, work: "" };
    }

    return {
        mobile: phone.mobile || "",
        work: phone.work || "",
    };
};

const normalizeOnboardingPayload = (body) => {
    const data = body.applicationData || body;
    const workAuthorizationSource = data.workAuthorizationDetail || data.workAuthorization;
    const workAuthorizationDetail = toWorkAuthorizationDetail(workAuthorizationSource, {
        workAuthType: data.workAuthorization,
        startDate: data.visaStartDate,
        endDate: data.visaEndDate,
    });
    const workAuthorization = workAuthorizationDetail.workAuthType || undefined;

    return {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        preferredName: data.preferredName,
        email: data.email,
        phone: toPhoneObject(data.phone),
        personalInfo: data.personalInfo,
        address: {
            building: data.address?.building || data.address?.buildingNumber,
            street: data.address?.street,
            city: data.address?.city,
            state: data.address?.state,
            zip: data.address?.zip || data.address?.zipCode,
        },
        workAuthorization,
        workAuthorizationDetail,
        visaStartDate: workAuthorizationDetail.startDate || data.visaStartDate,
        visaEndDate: workAuthorizationDetail.endDate || data.visaEndDate,
        reference: data.reference,
        emergencyContacts: data.emergencyContacts,
        documents: toDocumentObject(data.documents),
    };
};

const toApplicationResponse = (onboarding) => {
    if (!onboarding) {
        return null;
    }

    const data = onboarding.toObject ? onboarding.toObject() : onboarding;
    const workAuthorizationDetail = data.workAuthorizationDetail || toWorkAuthorizationDetail(
        data.workAuthorization,
        {
            startDate: data.visaStartDate,
            endDate: data.visaEndDate,
        }
    );

    return {
        ...data,
        userId: data.user,
        applicationData: {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            preferredName: data.preferredName,
            email: data.email,
            phone: toPhoneObject(data.phone),
            personalInfo: data.personalInfo,
            address: {
                building: data.address?.building,
                street: data.address?.street,
                city: data.address?.city,
                state: data.address?.state,
                zipCode: data.address?.zip,
            },
            workAuthorization: workAuthorizationDetail,
            reference: data.reference,
            emergencyContacts: data.emergencyContacts,
            documents: data.documents || {},
        },
    };
};

const getApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const application = await Onboarding.findOne({ user: userId });

        if (!application) {
            return generateResponse(res, 404, "Application not found.");
        }

        generateResponse(res, 200, "Successfully get application.", toApplicationResponse(application));
    } catch (error) {
        generateResponse(res, 500, "Server error during get application.");
    }
};

const submitApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const existingApp = await Onboarding.findOne({ user: userId });
        if (existingApp) {
            return generateResponse(res, 400, "Application already exists.");
        }

        const newApplication = new Onboarding({
            user: userId,
            status: 'pending',
            feedback: '',
            ...normalizeOnboardingPayload(req.body)
        });

        await newApplication.save();
        generateResponse(res, 201, "Successfully submit application.", toApplicationResponse(newApplication));
    } catch (error) {
        generateResponse(res, 500, "Submit application failed.");
    }
}

const updateApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedApplication = await Onboarding.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    status: 'pending',
                    feedback: '',
                    ...normalizeOnboardingPayload(req.body)
                }
            },
            { new: true }
        );

        if (!updatedApplication) {
            return generateResponse(res, 404, "Application not found.");
        }
        generateResponse(res, 200, "Successfully update application.", toApplicationResponse(updatedApplication));
    } catch (error) {
        generateResponse(res, 500, "Server error during update application.");
    }
}

const getS3PresignedUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.query;
        if (!fileName || !fileType) {
            return generateResponse(res, 400, "Missing file name or file type.");
        }

        const userId = req.user.id;
        const s3Key = `onboarding/${userId}/${Date.now()}_${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            ContentType: fileType
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`
        generateResponse(res, 200, "Successfully get S3 presigned URL.", { uploadUrl, fileUrl, s3Key });
    } catch (error) {
        generateResponse(res, 500, "Server error during get S3 presigned URL.");
    }
}

module.exports = { getApplication, submitApplication, updateApplication, getS3PresignedUrl }
