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

async function sendVerificationEmail(email, token) {
  const url = `${process.env.FRONTEND_URL}/verify/${token}`;

  await transporter.sendMail({
    from: `"Crime Alert System" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Please verify your email for Crime Alert System',
    html: `<p>Click <a href="${url}">this link</a> to verify your email. If you did not request, ignore this email.</p>`,
  });
}

module.exports = { sendVerificationEmail };
