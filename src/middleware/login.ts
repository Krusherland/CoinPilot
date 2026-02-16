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

export const validateLoginInput = async (req: Request, res: Response, next: NextFunction) => {
    
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

export const validateEmail = async (req: Request, res: Response, next: NextFunction) => {
    
}
