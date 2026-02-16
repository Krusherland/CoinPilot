import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../utils/Auth';
import { generateToken } from '../utils/Token';
import { AuthEmail } from '../emails/AuthEmail';


export class RegisterController { 
    static register = async (req: Request, res: Response) => { 
        try { 
            const user = new User(req.body);
            user.password = await hashPassword(user.password);
            user.token = generateToken();
            await user.save();
            await AuthEmail.sendVerificationEmail({ name: user.name, email: user.email, token: user.token });
            return res.status(201).json({ message: 'User registered successfully', user }); 
        } catch (error) { 
            return res.status(500).json({ message: 'Error registering user', error }); 
        } 
    }

    static verifyEmail = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const user = await User.findOne({where: {token} });
            if (!user) {
                return res.status(400).json({ message: 'Invalid token' });
            }
            user.verified = true;
            user.token = null;
            await user.save();
            res.json("Email verified successfully");
        } catch (error) {
            return res.status(500).json({ message: 'Error verifying email', error });
        }
    }
}