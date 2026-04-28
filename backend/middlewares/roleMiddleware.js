// for role-based access control. 
const requireRole = (...allowedRoles) => {
    return (req, res, next) =>{
        if (!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "Access denied: insufficient permissions"
            });
        }
        next();
    };
};
module.exports = requireRole;

/**
 * used in routes to protect endpoints.
 * e.g for employee: router.get('/profile', authMiddleware, requireRole('employee', 'hr'), getProfile);

 * used Factory Function and return a Express middleware function that checks if the user's role is included in the allowedRoles array. 
 *  (...allowedRoles) is REST Syntax. requireRole is the Factory Function
 */