const User = require('../models/User');
const generateJWTToken = require('../utils/generateJWTToken');
const { generateResponse, generateUserResponseData } = require('../utils/responseHandler');

const signin = async (req, res, _next) => {
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
        generateResponse(res, 200, "Successfully signin.", generateUserResponseData(user, token));
    } catch (error) {
        console.error("Signin Error:", error);
        generateResponse(res, 500, "Server error during signin.");
    }
}

module.exports = { signin };