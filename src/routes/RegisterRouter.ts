import { Router } from 'express';
import { body } from 'express-validator';
import { RegisterController } from '../controllers/RegisterController';
import { validateRegisterInput, validateUniqueEmail } from '../middleware/register';
import { limiter } from '../config/limiter';

const router = Router();

router.post('/create-account', 
    validateRegisterInput,
    validateUniqueEmail,
    RegisterController.register
);

router.post('/verify-email', 
    limiter,
    body('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token is required'), 
    RegisterController.verifyEmail);

export default router;