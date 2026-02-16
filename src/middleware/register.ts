import type { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const validateRegisterInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .isString().notEmpty().withMessage("Name is required").run(req);
    
    await body('email')
        .isEmail().withMessage("Must be a valid email")
        .notEmpty().withMessage("Email is required").run(req);
    
    await body('password')
        .isString().notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long").run(req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateUniqueEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error validating email', error });
    }
}
