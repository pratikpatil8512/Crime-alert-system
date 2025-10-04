const pool = require('../db');
const bcrypt = require('bcryptjs');

async function createUser(name, email, password, role, phone) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, role`,
    [name, email, hashedPassword, role, phone]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail };
