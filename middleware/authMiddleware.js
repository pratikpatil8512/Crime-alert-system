// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Authorization header malformed' });

  const token = parts[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token invalid or expired' });
    // attach payload to req.user
    req.user = payload;
    next();
  });
}

module.exports = authenticateToken;
