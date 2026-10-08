// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

// Layer 1 & 2: Authentication Identity
exports.protect = async (req, res, next) => {
    // 1. Get the token safely without optional chaining
    let token;

    const authHeader = req.header('Authorization');

    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. If there's no token, reject the request
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

        //Fetch current user details excluding password to keep req.user fresh
        const currentUser = await Staff.findById(decoded.id).select('-password ');
        if (!currentUser) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }
        // 4. Attach the decoded user payload
        req.user = currentUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
// RBAC Middleware: Authorize Roles
exports.authorize = (...allowedRoles) => {
    const roleSet = new Set(allowedRoles.flat());
    return (req, res, next) => {
        if (!req.user || !roleSet.has(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' is not allowed`
            });
        }
        next();
    };
};