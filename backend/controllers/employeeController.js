const Employee = require('../models/employee');
const Document = require('../models/document');
const VisaStatus = require('../models/VisaStatus');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

// Get Employeee profile by userId and get from JWT Token for safty issue.
const getProfile = async(req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if( !employee) return res.status(404).json({ message: 'Profile not Found'});
        res.json(employee); // 200 ok and return employee data
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
            { userId: req.user._id },
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
        const { cellPhone, workPhone } = req.body;
        if (!cellPhone) {
            return res.status(400).json({ message: 'Cell phone is required' });
        }
        const employee = await Employee.findOneAndUpdate(
            { userId: req.user._id },
            { cellPhone, workPhone },
            { new: true }
        );
        res.json({ message: 'Contact updated', data: { cellPhone, workPhone } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateEmployment = async (req, res) => {
    try {
        const { visaTitle, visaStart, visaEnd } = req.body;
        const employee = await Employee.findOneAndUpdate(
            { userId: req.user._id },
            { visaTitle, visaStart, visaEnd },
            { new: true }
        );
        res.json({ message: 'Employment updated', data: { visaTitle, visaStart, visaEnd } });
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
            {userId: req.user._id },
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
            {userId: req.user._id},
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

        const fileKey = `employee/${req.user._id}/${docType}/${uuidv4()}`; // unique file key for S3
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

// Step2: After file is uploaded to S3, save the file info to MongoDB
const confirmUpload = async (req, res) => {
    try {
        const {fileKey} = req.body;
        const docType = normalizeDocumentType(req.body.docType);

        if (!VISA_DOCUMENT_ORDER.includes(docType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        const employee = await Employee.findOne({ userId: req.user._id }); 
        if (!employee) {
            return res.status(404).json({ message: 'Profile not Found' });
        }

        const visaStatus = await VisaStatus.findOne({ employee: req.user._id });
        if (!visaStatus) {
            return res.status(404).json({ message: 'Visa status not found' });
        }

        const idx = VISA_DOCUMENT_ORDER.indexOf(docType);
        // opt recipt do not need to be approved, idx=== -1 means docType not in optOrder,do not need check. 
        if(idx > 0) {
            const preDoc = visaStatus.documents.find((document) => (
                document.documentType === VISA_DOCUMENT_ORDER[idx - 1]
            ));
            if (!preDoc) {
                return res.status(400).json({message: `Please wait for ${VISA_DOCUMENT_ORDER[idx-1]} to be approved first`});
            }

            if (preDoc.status !== 'approved') {
                return res.status(400).json({message: `Please wait for ${VISA_DOCUMENT_ORDER[idx-1]} to be approved first`});
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

        // create a new doc to track the file info in MongoDB, to tell HR,  initial status is pending 
        const doc = await Document.create({
            employeeId: employee._id,
            type: docType,
            fileUrl,
            fileKey,
            status: 'pending'
        });
        res.json({message: `Document uploaded, waiting for HR approval`, document: doc});
    } catch (error) { 
        res.status(500).json({ message: error.message });
    }
}

const getVisaStatus = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Profile not Found' });
        }

        if (employee.visaType !== 'F1(CPT/OPT)') {
            return res.json({ isOPT: false }); //if not F1, forntend will not render.
        }

        const visaStatus = await VisaStatus.findOne({ employee: req.user._id });
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
    confirmUpload,
    getVisaStatus
};
