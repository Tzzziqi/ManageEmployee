const express = require('express');
const router = express.Router();
const { validateInviteToken, register } = require('../controllers/registerController');
const { generateResponse } = require("../utils/responseHandler");
const verifyJWT = require("../middlewares/authMiddleware");
const { signIn } = require("../controllers/authController");
const { getApplication, submitApplication, updateApplication, getS3PresignedUrl } = require("../controllers/applicationController");

// for public w/ token
router.get('/validateInvite/:inviteToken', validateInviteToken, (req, res) => generateResponse(res, 200, "The invite token is valid"));

router.post('/register/:inviteToken', validateInviteToken, register);


// for private user
router.post('/signIn', signIn);

// for application
router.get('/application', verifyJWT, getApplication);
router.post('/application', verifyJWT, submitApplication);
router.put('/application', verifyJWT, updateApplication);
router.get('/upload-url', verifyJWT, getS3PresignedUrl);

module.exports = router;