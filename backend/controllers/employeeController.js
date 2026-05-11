const Employee = require('../models/employee');
const VisaStatus = require('../models/VisaStatus');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Document = require('../models/document');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const VISA_DOCUMENT_ORDER = ['OPT_RECEIPT', 'OPT_EAD', 'I_983', 'I_20'];
const LEGACY_DOCUMENT_TYPES = {
    I983: 'I_983',
    I20: 'I_20',
    OPT_EDA: 'OPT_EAD',
    '-20': 'I_20',
};

const normalizeDocumentType = (docType) => LEGACY_DOCUMENT_TYPES[docType] || docType;
const getUserId = (req) => req.user.id;
const getSafeFileName = (fileName = 'document') =>
    String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');

const saveVisaDocumentUpload = async ({ userId, docType, fileKey }) => {
    const employee = await Employee.findOne({ userId });
    if (!employee) {
        const error = new Error('Profile not Found');
        error.statusCode = 404;
        throw error;
    }

    const visaStatus = await VisaStatus.findOne({ employee: userId });
    if (!visaStatus) {
        const error = new Error('Visa status not found');
        error.statusCode = 404;
        throw error;
    }

    const idx = VISA_DOCUMENT_ORDER.indexOf(docType);
    if(idx > 0) {
        const preDoc = visaStatus.documents.find((document) => (
            document.documentType === VISA_DOCUMENT_ORDER[idx - 1]
        ));
        if (!preDoc || preDoc.status !== 'approved') {
            const error = new Error(`Please wait for ${VISA_DOCUMENT_ORDER[idx-1]} to be approved first`);
            error.statusCode = 400;
            throw error;
        }
    }

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    let visaDocument = visaStatus.documents.find((document) => document.documentType === docType);
    if (!visaDocument) {
        visaStatus.documents.push({ documentType: docType });
        visaDocument = visaStatus.documents[visaStatus.documents.length - 1];
    }

    visaDocument.fileUrl = fileUrl;
    visaDocument.fileName = fileKey.split('/').pop();
    visaDocument.status = 'pending';
    visaDocument.feedback = '';
    visaDocument.uploadedAt = new Date();
    visaDocument.reviewedAt = undefined;
    visaDocument.approvedAt = undefined;
    await visaStatus.save();

    return { visaDocument, visaStatus };
};

// Get Employeee profile by userId and get from JWT Token for safty issue.
const getProfile = async (req, res) => {
    try {
        const userId = getUserId(req);
        const employee = await Employee.findOne({ userId });
        if (!employee) return res.status(404).json({ message: 'Profile not Found' });

        const visaDocs = await Document.find({ employeeId: employee._id });

        const Onboarding = require('../models/Onboarding');
        const onboarding = await Onboarding.findOne({ user: userId }).select('documents');
        const onboardingDocs = [];
        if (onboarding?.documents) {
            const d = onboarding.documents;
            if (d.driverLicense?.url)     onboardingDocs.push({ type: 'Drivers_License', fileUrl: d.driverLicense.url });
            if (d.workAuthorization?.url) onboardingDocs.push({ type: 'Work_Auth',       fileUrl: d.workAuthorization.url });
        }

        res.json({
            ...employee.toObject(),
            documents: [...onboardingDocs, ...visaDocs],
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateName = async (req, res) => {
    try {
        const { firstName, lastName, middleName, preferredName } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First name and last name are required' });
        }
        const employee = await Employee.findOneAndUpdate(
            { userId: getUserId(req) },
            { firstName, lastName, middleName, preferredName },
            { new: true }
        );
        res.json({ message: 'Name updated', data: { firstName, lastName, middleName, preferredName } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateContact = async (req, res) => {
    try {
        const { mobile, work } = req.body;
        if (!mobile) {
            return res.status(400).json({ message: 'mobile phone is required' });
        }
        const employee = await Employee.findOneAndUpdate(
            { userId: getUserId(req) },
            { phone: { mobile, work } },
            { new: true }
        );
        res.json({ message: 'Contact updated', data: { phone: employee.phone } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateEmployment = async (req, res) => {
    try {
        const { visaStartDate, visaEndDate, workAuthorizationDetail } = req.body;
        const employee = await Employee.findOneAndUpdate(
            { userId: getUserId(req) },
            { visaStartDate, visaEndDate, workAuthorizationDetail },
            { new: true }
        );
        res.json({ message: 'Employment updated', data: { visaStartDate, visaEndDate, workAuthorizationDetail } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Only update the Address. 
const updateAddress = async (req, res) => {
    try {
        const { building, street, city, state, zip } = req.body;
        if (!street || !city || !state || !zip) {
            return res.status(400).json({message: 'Street, city, state, zip are required'});
        }
        const employee = await Employee.findOneAndUpdate(
            {userId: getUserId(req) },
            {address: { building, street, city, state, zip }},
            {new: true, runValidators: true } // runValidators is from Mongoose, it will run the validation rules defined in the schema when updating.
        );
        // only return address updated to UI coz the Minimal return principlle, reduce newtwork transfer. 
        res.json({ message: 'Address updated', address: employee.address })
    } catch (error) { res.status(500).json({ message: error.message }); 
}
    };

// If employee need to updated the emergncy contracts
const updateEmergencyContact = async (req, res) => {
    try {
        const { emergencyContacts } = req.body;
        if (!emergencyContacts || emergencyContacts.length === 0) {
            return res.status(400).json({message: 'At least 1 emergncy contact required'});
        }
        const employee = await Employee.findOneAndUpdate(
            {userId: getUserId(req)},
            {emergencyContacts: emergencyContacts},
            {new:true}
        );
        res.json({ message: 'Emergency Contacts Upadted', emergencyContacts: employee.emergencyContacts });
    } catch(error) {
        res.status(500).json({ message: error.message})
    }
}

//Part2：File modfily section
// First get the S3 Presigned URL before upload the file to S3, then save the file info to MongoDB.
const getUploadUrl = async (req, res) => {
    try {
        const { fileType } = req.body;
        const docType = normalizeDocumentType(req.body.docType);

        if (!VISA_DOCUMENT_ORDER.includes(docType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        const fileKey = `employee/${getUserId(req)}/${docType}/${uuidv4()}`; // unique file key for S3
        // PutObjectCommand = instruction for "I want to PUT a file to S3"
        // Not uploaded yet — just describes a future operation
        const command = new PutObjectCommand ({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType // e.g 'image/jpeg'
        });
        // getSignedUrl：the temp URL is formed by credentials + command 
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });  // URL expires in 15mins
        res.json({ uploadUrl, fileKey}); // return two things to frondend
    } catch (error) {
        res.status(500).json({ message: error.message});
    }; }

const uploadDocument = async (req, res) => {
    try {
        const docType = normalizeDocumentType(req.query.docType || req.body?.docType);
        const fileType = req.headers['content-type'];
        const fileName = getSafeFileName(req.query.fileName);

        if (!VISA_DOCUMENT_ORDER.includes(docType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({ message: 'File is required' });
        }

        const fileKey = `employee/${getUserId(req)}/${docType}/${uuidv4()}_${fileName}`;
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: req.body,
            ContentType: fileType,
        });

        await s3.send(command);
        const { visaDocument, visaStatus } = await saveVisaDocumentUpload({
            userId: getUserId(req),
            docType,
            fileKey,
        });

        res.json({
            message: 'Document uploaded, waiting for HR approval',
            document: visaDocument,
            visaStatus,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// Step2: After file is uploaded to S3, save the file info to MongoDB
const confirmUpload = async (req, res) => {
    try {
        const {fileKey} = req.body;
        const docType = normalizeDocumentType(req.body.docType);

        if (!VISA_DOCUMENT_ORDER.includes(docType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        const { visaDocument, visaStatus } = await saveVisaDocumentUpload({
            userId: getUserId(req),
            docType,
            fileKey,
        });

        res.json({
            message: `Document uploaded, waiting for HR approval`,
            document: visaDocument,
            visaStatus,
        });
    } catch (error) { 
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

const getVisaStatus = async (req, res) => {
    try {
        const visaStatus = await VisaStatus.findOne({ employee: getUserId(req) });
        const employee = await Employee.findOne({ userId: getUserId(req) });

        if (!employee && !visaStatus) {
            return res.status(404).json({ message: 'Profile not Found' });
        }

        if (employee && !['F1(CPT/OPT)', 'F1', 'OPT'].includes(employee.workAuthorization)) {
            return res.json({ isOPT: false }); //if not F1, forntend will not render.
        }

        const docs = visaStatus?.documents || [];
        const docMap = {};
        docs.forEach((document) => {
            docMap[normalizeDocumentType(document.documentType)] = document;
        });

        res.json({
            isOPT: true,
            OPT_RECEIPT: docMap['OPT_RECEIPT'] || null,
            OPT_EAD: docMap['OPT_EAD'] || null,
            I_983: docMap['I_983'] || null,
            I_20: docMap['I_20'] || null
        });
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getProfile,
    updateName,
    updateAddress,
    updateContact,
    updateEmergencyContact,
    updateEmployment,
    getUploadUrl,
    uploadDocument,
    confirmUpload,
    getVisaStatus
};
