const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../models/user');
require('dotenv').config();

const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = await createUser(name, email, password, role, phone);
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
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
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login };
