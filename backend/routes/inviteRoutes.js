const express = require('express');
const router = express.Router();
const { getAllInvites, revokeInvite, generateInvite } = require('../controllers/inviteController');
const verifyJWT = require("../middlewares/authMiddleware");

router.get('/',verifyJWT, getAllInvites);

router.patch('/:id/revoke',verifyJWT,revokeInvite);

router.post('/generate',verifyJWT, generateInvite);

module.exports = router;