const express = require('express');

const router = express.Router();

const { register, login, verifyOtp } = require('../controllers/authController');

router.post('/register', register);

router.post('/login', login);

// Change to POST route with verifyOtp handler (matches OTP flow)
router.post('/verify-otp', verifyOtp);

console.log("Register:", register);
console.log("Login:", login);
console.log("VerifyOtp:", verifyOtp);


module.exports = router;
