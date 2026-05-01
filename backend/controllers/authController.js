const User = require('../models/User');
const generateJWTToken = require('../utils/generateJWTToken');
const { generateResponse, generateUserResponseData } = require('../utils/responseHandler');

const signIn = async (req, res, _next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return generateResponse(res, 400, "Invalid username or password.");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return generateResponse(res, 400, "Invalid username or password.");
        }

        const token = generateJWTToken(user);
        generateResponse(res, 200, "Successfully sign in.", generateUserResponseData(user, token));
    } catch (error) {
        console.error("Sign in Error:", error);
        generateResponse(res, 500, "Server error during sign in.");
    }
}

module.exports = { signIn };