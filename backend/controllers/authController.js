const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createUser, findUserByEmail, findUserByVerificationToken, verifyUserEmail } = require('../models/user');
const { sendVerificationEmail } = require('../utils/email');
require('dotenv').config();

const register = async (req, res) => {
  const { name, email, password, role, phone, dob } = req.body;

  // Password must have min 8 chars, uppercase, lowercase, digit, special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  // Phone must be exactly 10 digits (optional)
  const phoneRegex = /^[0-9]{10}$/;
  // DOB format YYYY-MM-DD
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (dob && !dobRegex.test(dob)) {
    return res.status(400).json({ error: 'Invalid date of birth format. Use YYYY-MM-DD.' });
  }

  if (dob) {
    const dobDate = new Date(dob);
    const ageDiffMs = Date.now() - dobDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) {
      return res.status(400).json({ error: 'You must be at least 18 years old to register.' });
    }
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
    });
  }

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Phone number must be 10 digits' });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await createUser(name, email, passwordHash, role, phone, verificationToken, dob);

    // Send verification email asynchronously, log errors but don't block
    sendVerificationEmail(email, verificationToken).catch(console.error);

    res.status(201).json({ message: 'User registered. Please verify your email to activate your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await findUserByVerificationToken(token);

    if (!user) {
      return res.status(400).send('Invalid or expired verification token');
    }

    await verifyUserEmail(user.user_id);

    res.send('Email verified successfully. You can now login.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    if (!user.is_verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, verifyEmail };
