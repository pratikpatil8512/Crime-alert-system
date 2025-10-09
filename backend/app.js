const express = require('express');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const pool = require('./db');
const authenticateToken = require('./middleware/authMiddleware');

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount authentication routes (register, verify-otp, login, etc.)
app.use('/api/auth', authRoutes);

// Example protected route (uses your auth middleware)
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Trip API route
app.post('/api/trips', async (req, res) => {
    try {
        const { userId, source, destination, startTime, endTime } = req.body;
        const result = await pool.query(
            `INSERT INTO user_trips (user_id, source, destination, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, source, destination, startTime, endTime]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error creating trip' });
    }
});

// Crime retrieval route (fill in your logic)
app.get('/api/crimes', async (req, res) => {
    // Implement crime data logic here
    res.json({ message: 'Crime retrieval not implemented.' });
});

// Alert and complaint routes (example placeholders)
app.post('/api/alerts', async (req, res) => {
    res.json({ message: 'Alert registration endpoint.' });
});

app.post('/api/complaints', async (req, res) => {
    res.json({ message: 'Complaint registration endpoint.' });
});

// Central error handler for production robustness
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
