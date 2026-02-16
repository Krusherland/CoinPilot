import { Router } from 'express';
import { validateLoginInput, validateEmail } from '../middleware/login';
import { limiter } from '../config/limiter';
import { LoginController } from '../controllers/LoginController';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';


const router = Router();

router.use(limiter)

router.post('/login', 
    validateLoginInput,
    validateEmail,
    LoginController.login
);

router.post('/forgot-password',
    validateEmail,
    LoginController.forgotPassword
);

router.post('/validate-reset-token',
    body('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token is required'),
    LoginController.validateResetToken
);

router.post('/reset-password/:token',
    param('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token is required'),
    body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    LoginController.resetPassword
);

router.get('/user', 
    authenticate , 
    LoginController.user
);

router.post('/update-password',
    authenticate,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    LoginController.updatePassword
);

router.post('/check-password',
    authenticate,
    body('Password').notEmpty().withMessage('Current password is required'),
    LoginController.checkPassword
);
export default router;