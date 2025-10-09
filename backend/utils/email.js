const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Send OTP mail
async function sendOtpEmail(email, otp) {
    await transporter.sendMail({
        from: `Crime Alert System <${process.env.SMTPUSER}>`,
        to: email,
        subject: 'Your OTP for Email Verification',
        html: `<p>Your OTP to verify your email is: <b>${otp}</b></p>
               <p>This OTP is valid for 10 minutes.</p>`
    });
}

module.exports = sendOtpEmail;
