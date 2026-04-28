const Employee = require('../models/Employee');
const Document = require('../models/Document');
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

// Get Employeee profile by userId and get from JWT Token for safty issue.
const getProfile = async(req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if( !employee) return res.status(404).json({ message: 'Profile not Found'});
        res.json(employee); // 200 ok and return employee data
    } catch (error) {
        res.status(500).json({ message: err.message });
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
            {userId: req.user.Id },
            {address: { building, street, city, state, zip }},
            {new: true, runValidators: true } // runValidators is from Mongoose, it will run the validation rules defined in the schema when updating.
        );
        // only return address updated to UI coz the Minimal return principlle, reduce newtwork transfer. 
        res.json({ message: 'Address updated', address: employee.address })
    } catch (error) { res.status(500).json({ message: err.message }); 
}
    };

// If employee need to updated the emergncy contracts
const updateEmergencyContact = async (req, res) => {
    try {
        const { emergencyContacts } = req.body;
        if (!emergcyContacts || emergencyCoontacts.length === 0) {
            return res.status(400).json({message: 'At least 1 emergncy contact required'});
        }
        const employee = await Employess.findOneAndUpdate(
            {userId: req.user._id},
            {emergencyContacts: emergencyContacts},
            {new:true}
        );
        res.json({ message: 'Emergency Contacts Upadted', emergencyContacts: employee.emergencyContacts });
    } catch(error) {
        res.status(500).json({ message: err.message})
    }
}

//Part2：File modfily section
// First get the S3 Presigned URL before upload the file to S3, then save the file info to MongoDB.
const getUploadUrl = async (req, res) => {
    try {
        const { fileType, docType } = req.body;
        const fileKey = `employee/${req.user._id}/${docType}/${uuidv4()}`; // unique file key for S3
        // PutObjectCommand = instruction for "I want to PUT a file to S3"
        // Not uploaded yet — just describes a future operation
        const command = new PutObjectCommand ({
            Bucket: process.env.AWS.BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType // e.g 'image/jpeg'
        });
        // getSignedUrl：the temp URL is formed by credentials + command 
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });  // URL expires in 15mins
        res.json({ uploadUrl, fileKey}); // return two things to frondend
    } catch (error) {
        res.status(500).json({ message: err.message});
    }; }

// Step2: After file is uploaded to S3, save the file info to MongoDB
const confirmUpload = async (req, res) => {
    try {
        const {fileKey, docType} = req.body;
        const employess = await Employee.findOne({userId: req.uer._id });
        const optOrder = ['OptReceipt', 'OPT_EAD', 'I1983', 'I20'];
        const idx = optOrder.indexOf(docType);
        // opt recipt do not need to be approved, idx=== -1 means docType not in optOrder,do not need check. 
        if(idx > 0) {
            const preDoc = await document.findOne({
                employeeId: employee._id,
                type: optOrder[idx - 1],  
                status: 'approved'  
            });
            if (!preDoc) {
                return res.status(400).json({message: `Please wit for ${optOrder[idx-1]} to be approved first`});
            }
        }
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        // create a new doc to track the file info in MongoDB, to tell HR,  initial status is pending 
        const doc = await document.create({
            employeeId: employee._id,
            type: docType,
            fileUrl,
            fileKey,
            status: 'Pending'
        });
        res.json({message: `Document uploaded, waiting for HR approval`, document: doc});
    } catch (error) { 
        res.status(500).json({ message: err.message });
    }
}

const getVisaStatus = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (employee.visaType !== 'F1(CPT/OPT)') {
            return res.json({ isOPT: false }); //if not F1, forntend will not render.
        }
        const docs = await Document.find({
            employeeId: employee._id,
            type: { $in: ['OptReceipt', 'OPT_EAD', 'I983', 'I20'] }
        });
        // Transform the docs array into a map so you can use key:value to get doc info. 
        const docMap = {};
        docs.forEach(d=> { docMap[d.type] = d; });

        res.json({
            isOPT: true,
            OptReceipt: docMap['OptReceipt'] || null,
            OPT_EAD: docMap['OPT_EAD'] || null,
            I983: docMap['I983'] || null,
            I20: docMap['I20'] || null
        });
    } catch(error) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getProfile, updateAddress, updateEmergencyContact, getUploadUrl, confirmUpload, getVisaStatus
}