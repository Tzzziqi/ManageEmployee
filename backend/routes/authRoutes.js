const express = require('express');
const router = express.Router();
const { validateInviteToken, register } = require('../controllers/registerController');
const { generateResponse } = require("../utils/responseHandler");

// for public w/ token
router.get('/validateInvite/:token', validateInviteToken, (req, res) => generateResponse(res, 200, "The token is valid"));

router.post('/register/:token', validateInviteToken, register);


// for private user

module.exports = router;