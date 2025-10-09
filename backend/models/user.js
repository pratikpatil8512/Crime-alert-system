const pool = require('../db');
const bcrypt = require('bcryptjs');

// Create user with OTP and expiry
async function createUser(name, email, password, role, phone, otp, otpExpiry, dob) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, phone, otp, otp_expiry, dob, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
        RETURNING user_id, name, email, role, is_verified`,
        [name, email, hashedPassword, role, phone, otp, otpExpiry, dob]
    );
    return result.rows[0];
}

async function findUserByEmail(email) {
    const result = await pool.query(
        `SELECT user_id, name, email, password_hash, role, is_verified, otp, otp_expiry
         FROM users WHERE email=$1`,
        [email]
    );
    return result.rows[0];
}

// Mark user as verified
async function verifyUserEmail(userId) {
    await pool.query(
        `UPDATE users SET is_verified=true, otp=NULL, otp_expiry=NULL WHERE user_id=$1`,
        [userId]
    );
    return true;
}

module.exports = {
    createUser,
    findUserByEmail,
    verifyUserEmail,
};
