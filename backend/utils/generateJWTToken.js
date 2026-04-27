const jwt = require('jsonwebtoken');

const generateJWTToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '1d'
        }
    );
};

module.exports = generateJWTToken;