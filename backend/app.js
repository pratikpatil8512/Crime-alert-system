const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

app.use(express.json()); // to parse JSON request bodies

app.use('/api/auth', authRoutes);

// Example protected route (needs auth middleware you created earlier)
const authenticateToken = require('./middleware/authMiddleware');
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
