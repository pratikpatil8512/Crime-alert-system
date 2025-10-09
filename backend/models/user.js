const pool = require('../db');
const bcrypt = require('bcryptjs');

async function createUser(name, email, password, role, phone, verificationToken, dob) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone, verification_token, dob)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, name, email, role, is_verified`,
    [name, email, hashedPassword, role, phone, verificationToken, dob]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT user_id, name, email, password_hash, role, is_verified FROM users WHERE email=$1',
    [email]
  );
  return result.rows[0];
}

async function findUserByVerificationToken(token) {
  const result = await pool.query(
    'SELECT * FROM users WHERE verification_token=$1',
    [token]
  );
  return result.rows[0];
}

async function verifyUserEmail(userId) {
  await pool.query(
    'UPDATE users SET is_verified=true, verification_token=NULL WHERE user_id=$1',
    [userId]
  );
  return true;
}

module.exports = { createUser, findUserByEmail, findUserByVerificationToken, verifyUserEmail };
