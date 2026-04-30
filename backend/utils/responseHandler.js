const generateResponse = (res, statusCode, message, data = null) => {
    const success = statusCode >= 200 && statusCode < 300;
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};

const generateUserResponseData = (user, token = null) => {
    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            role: user.role
        }
    };
};

module.exports = { generateResponse, generateUserResponseData };