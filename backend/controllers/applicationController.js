const Application = require('../models/Application');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { generateResponse, generateUserResponseData } = require('../utils/responseHandler');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const getApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const application = await Application.findOne({ userId });

        if (!application) {
            return generateResponse(res, 404, "Application not found.");
        }

        generateResponse(res, 200, "Successfully get application.", application);
    } catch (error) {
        generateResponse(res, 500, "Server error during get application.");
    }
};

const submitApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const existingApp = await Application.findOne({ userId });
        if (existingApp) {
            return generateResponse(res, 400, "Application already exists.");
        }

        const newApplication = new Application({
            userId,
            status: 'pending',
            applicationData: req.body
        });

        await newApplication.save();
        generateResponse(res, 201, "Successfully submit application.", newApplication);
    } catch (error) {
        generateResponse(res, 500, "Submit application failed.");
    }
}

const updateApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedApplication = await Application.findOneAndUpdate(
            { userId },
            {
                $set: {
                    applicationData: req.body,
                    status: 'pending',
                    feedback: ''
                }
            },
            { new: true }
        );

        if (!updatedApplication) {
            return generateResponse(res, 404, "Application not found.");
        }
        generateResponse(res, 200, "Successfully update application.", updatedApplication);
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
