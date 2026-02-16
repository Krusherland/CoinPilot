import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    const [, token] = bearer.split(' ');
    if (!bearer || !token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === 'object' && 'id' in decoded) {
            req.user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email',]
            });
            next();
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
}
