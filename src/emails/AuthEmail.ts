import transport from '../config/nodemailer';

type EmailType = {
    name: string;
    email: string;
    token: string;
}


export class AuthEmail {
    static sendVerificationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: '"CoinPilot" <admin@coinpilot.com>',
            to: user.email,
            subject: 'Verify Your Email in CoinPilot',
            html: `<p>Hi ${user.name},</p>
                   <p>Thank you for registering with CoinPilot! Please verify your email address by clicking the link below:</p>
                   <a href="https://coinpilot.com/verify-email?token=${user.token}">Verify Email</a>
                   <p>If you did not create an account, please ignore this email.</p>
                   <p>Best regards,<br/>The CoinPilot Team</p>`
        })
    }

     static sendResetEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
        from: 'CoinPilot <no-reply@coinpilot.com>',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset. Click the link below to reset your password:</p>
               <a href="https://coinpilot.com/reset-password?token=${user.token}">Reset Password</a>
               <p>If you did not request this, please ignore this email.</p>`
        });
        console.log('Password reset email sent: %s', email.messageId);
    }   
}