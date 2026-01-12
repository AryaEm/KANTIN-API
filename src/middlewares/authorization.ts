import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
// import { JWT_SECRET } from "../global";

interface JwtPayload {
    id: string;
    username: string;
    role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    console.log("JWT_SECRET in middleware:", process.env.JWT_SECRET);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secretKey = process.env.JWT_SECRET
        if (!secretKey) {
            return res.status(500).json({ message: "Server misconfiguration" });
        }
        const decoded = verify(token, secretKey) as {
            id: number
            role: "admin_stan" | "siswa"
        }

        res.locals.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

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

export const verifyRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
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