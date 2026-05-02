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

const toDocumentList = (documents = {}) => {
    if (Array.isArray(documents)) {
        return documents.map((document) => ({
            name: document.name || document.documentType,
            url: document.url || document.fileUrl || '',
            fileUrl: document.fileUrl || document.url || '',
            s3Key: document.s3Key,
            uploadedAt: document.uploadedAt
        }));
    }

    return Object.entries(documents)
        .filter(([, document]) => document?.url || document?.fileUrl)
        .map(([name, document]) => ({
            name: name === 'workAuthorization' ? 'OPT_RECEIPT' : name,
            url: document.url || document.fileUrl || '',
            fileUrl: document.fileUrl || document.url || '',
            s3Key: document.s3Key,
            uploadedAt: document.uploadedAt
        }));
};

const normalizeOnboardingPayload = (body) => {
    const data = body.applicationData || body;
    const workAuthorization = data.workAuthorization?.workAuthType || data.workAuthorization;

    return {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        preferredName: data.preferredName,
        email: data.email,
        phone: data.phone?.mobile || data.phone,
        personalInfo: data.personalInfo,
        address: {
            building: data.address?.building || data.address?.buildingNumber,
            street: data.address?.street,
            city: data.address?.city,
            state: data.address?.state,
            zip: data.address?.zip || data.address?.zipCode,
        },
        workAuthorization,
        visaStartDate: data.visaStartDate || data.workAuthorization?.startDate,
        visaEndDate: data.visaEndDate || data.workAuthorization?.endDate,
        reference: data.reference,
        emergencyContacts: data.emergencyContacts,
        documents: toDocumentList(data.documents),
    };
};

const toApplicationResponse = (onboarding) => {
    if (!onboarding) {
        return null;
    }

    const data = onboarding.toObject ? onboarding.toObject() : onboarding;

    return {
        ...data,
        userId: data.user,
        applicationData: {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            preferredName: data.preferredName,
            email: data.email,
            phone: {
                mobile: data.phone,
                work: '',
            },
            personalInfo: data.personalInfo,
            address: {
                building: data.address?.building,
                street: data.address?.street,
                city: data.address?.city,
                state: data.address?.state,
                zipCode: data.address?.zip,
            },
            workAuthorization: {
                workAuthType: data.workAuthorization,
                startDate: data.visaStartDate,
                endDate: data.visaEndDate,
            },
            reference: data.reference,
            emergencyContacts: data.emergencyContacts,
            documents: data.documents || [],
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
