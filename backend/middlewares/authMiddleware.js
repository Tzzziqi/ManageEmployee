const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    // const authHeader = req.headers.authorization;
    //
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return res.status(401).json({
    //         message: 'Access Denied: No token provided. Please log in first.'
    //     });
    // }
    //
    // const token = authHeader.split(' ')[1];
    //
    // try {
    //     req.user = jwt.verify(token, process.env.JWT_SECRET);
    //     next();
    // }
}