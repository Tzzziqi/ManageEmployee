const RegistrationToken = require('../models/RegistrationToken');
const User = require('../models/User');
const generateJWTToken = require('../utils/generateJWTToken');
const { generateResponse, generateUserResponseData } = require('../utils/responseHandler');
const mongoose = require('mongoose');

const validateInviteToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const tokenInfo = await RegistrationToken.findOne({ token: token });

        if (!tokenInfo || tokenInfo.expirationDate < new Date()) {
            return generateResponse(res, 400, "The link is no longer valid.");
        }

        if (tokenInfo.status === "used") {
            return generateResponse(res, 400, "The link has already been used.");
        }

        if (tokenInfo.status === "revoked") {
            return generateResponse(res, 400, "The link has already been revoked by an administrator.");
        }

        req.tokenInfo = tokenInfo;
        next();

    } catch (error) {
        console.error("Token validation error:", error);
        next(error);
    }
}

const register = async (req, res, _next) => {
    const { token, email, role } = req.tokenInfo;
    const { username, password } = req.body;

    if (!password || password.length < 8) {
        return generateResponse(res, 400, "Password must be at least 8 characters.");
    }

    if (!username || username.length < 4) {
        return generateResponse(res, 400, "Username must be at least 4 characters.");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        if (existingUser.email === email) {
            return generateResponse(res, 400, "Email already registered.");
        }

        if (existingUser.username === username) {
            return generateResponse(res, 400, "Username already been used.");
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [newUser] = await User.create([{ username, email, password, role }], { session });
        await RegistrationToken.updateOne({ token }, { status: 'used' }, { session });
        await session.commitTransaction();
        const jwtToken = generateJWTToken(newUser);
        const responseData = generateUserResponseData(newUser, jwtToken);
        generateResponse(res, 201, "Successfully register.", responseData);
    } catch (error) {
        await session.abortTransaction();
        console.error("Register Error:", error);
        generateResponse(res, 500, "Server error during registration.");
    } finally {
        await session.endSession();
    }
}

module.exports = { validateInviteToken, register };