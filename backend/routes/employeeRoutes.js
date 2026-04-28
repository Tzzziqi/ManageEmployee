// Request comes in → authMiddleware: Are you logged in? → requireRole: Is the role correct? → Controller: Execute business logic
const express      = require('express');
const router       = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');  
const requireRole  = require('../middlewares/roleMiddleware');
const {
  getProfile, updateAddress, updateEmergencyContact,
  getUploadUrl, confirmUpload, getVisaStatus
} = require('../controllers/employeeController');

const employeeOrHR = [authMiddleware, requireRole('employee', 'hr')];

router.get('/profile',                    ...employeeOrHR, getProfile);
router.put('/profile/address',            ...employeeOrHR, updateAddress);
router.put('/profile/emergency-contacts', ...employeeOrHR, updateEmergencyContact);

router.post('/documents/upload-url',      ...employeeOrHR, getUploadUrl);
router.post('/documents/confirm',         ...employeeOrHR, confirmUpload);

router.get('/visa-status',                ...employeeOrHR, getVisaStatus);

module.exports = router;