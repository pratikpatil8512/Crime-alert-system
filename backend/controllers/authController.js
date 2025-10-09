const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, verifyUserEmail } = require('../models/user');
const sendOtpEmail = require('../utils/email');
require('dotenv').config();

// Registration with OTP logic
const register = async (req, res) => {
  const { name, email, password, role, phone, dob } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const phoneRegex = /^[0-9]{10}$/;
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dobRegex.test(dob)) {
    return res.status(400).json({ error: "Invalid date of birth format. Use YYYY-MM-DD." });
  }
  const dobDate = new Date(dob);
  const age = Math.abs(new Date(Date.now() - dobDate.getTime()).getUTCFullYear() - 1970);
  if (age < 18) {
    return res.status(400).json({ error: "You must be at least 18 years old to register." });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." });
  }
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Phone number must be 10 digits." });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await createUser(name, email, password, role, phone, otp, otpExpiry, dob);
    try {
      await sendOtpEmail(email, otp);
    } catch (e) {
      console.error("OTP email failed: ", e);
    }
    res.status(201).json({ message: "User registered. Please verify your email using the OTP sent to your email address." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// OTP verification endpoint
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isverified) return res.status(400).json({ error: "Email already verified" });

    if (user.otp !== otp || !user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await verifyUserEmail(user.user_id);
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login function
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.isverified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordhash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
};
