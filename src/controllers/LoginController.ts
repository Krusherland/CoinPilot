import { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/Auth';
import { generateJWT } from '../config/jwt';
import { generateToken } from '../utils/Token';
import { AuthEmail } from '../emails/AuthEmail';


export class LoginController { 
    static login = async (req: Request, res: Response) => { 
        try { 
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            if (!user.verified){
                return res.status(400).json({ message: 'User not verified' });
            }
            const isPasswordCorrect = await checkPassword(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            const token = generateJWT(user.id);
            res.json( token );
        } catch (error) { 
            return res.status(500).json({ message: 'Error logging in user', error }); 
        } 
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }
        user.token = generateToken();
        await user.save();
        await AuthEmail.sendResetEmail({ name: user.name, email: user.email, token: user.token });
        return res.json({ message: 'Password reset email sent' });
    }  

    static validateResetToken = async (req: Request, res: Response) => {
        const { token } = req.body;
        
        const tokenExists = await User.findOne({ where: { token } });
        if (!tokenExists) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        return res.json({ message: 'Token is valid' });
    }

    static resetPassword = async (req: Request, res: Response) => {
        const { token } = req.params;
        const { newPassword } = req.body;
        
        const user = await User.findOne({ where: { token } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        user.password = await hashPassword(newPassword);
        user.token = null;
        await user.save();
        return res.json({ message: 'Password has been reset successfully' });
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user);
    }

    static updatePassword = async (req: Request, res: Response) => {
        const { currentPassword, newPassword } = req.body;
        const {id} = req.user;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordCorrect = await checkPassword(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = await hashPassword(newPassword);
        await user.save();
        return res.json({ message: 'Password has been updated successfully' });
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { Password } = req.body;
        const {id} = req.user;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordCorrect = await checkPassword(Password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }
        return res.json({ message: 'Password is correct' });
    }
}