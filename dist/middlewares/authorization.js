"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const secretKey = process.env.SECRET;
        if (!secretKey) {
            return res.status(500).json({ message: "Server misconfiguration" });
        }
        const decoded = (0, jsonwebtoken_1.verify)(token, secretKey);
        res.locals.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.verifyToken = verifyToken;
// export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//         return res.status(403).json({ message: 'Access denied. No token provided.' });
//     }
//     try {
//         const secretKey = SECRET || ""
//         const decoded = verify(token, secretKey) as {
//             id: number
//             role: "admin_stan" | "siswa"
//         }
//         res.locals.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Invalid token.' });
//     }
// };
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = res.locals.user;
        if (!user) {
            return res.status(403).json({ message: 'No user information available.' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403)
                .json({ message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}` });
        }
        next();
    };
};
exports.verifyRole = verifyRole;
