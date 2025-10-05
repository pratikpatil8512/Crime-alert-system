const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const pool = require('./db'); 


app.use(express.json()); // to parse JSON request bodies

app.use('/api/auth', authRoutes);

// Example protected route (needs auth middleware you created earlier)
const authenticateToken = require('./middleware/authMiddleware');
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

//trip api
app.post('/api/trips', async (req, res) => {
  const { userId, source, destination, startTime, endTime } = req.body;
  const result = await pool.query(
    `INSERT INTO user_trips (user_id, source, destination, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, source, destination, startTime, endTime]
  );
  res.json(result.rows[0]);
});

// crime retrival

// GET /api/crimes?lat=...&long=...&date=...
app.get('/api/crimes', async (req, res) => {
  const { lat, long, date } = req.query;
  const result = await pool.query(
    `SELECT * FROM crime_data WHERE date = $1 AND ST_DWithin(location, ST_MakePoint($2, $3)::geography, 500)`,
    [date, long, lat]
  );
  res.json(result.rows);
});


//alert endpoint

app.get('/api/alerts', async (req, res) => {
  const { userId } = req.query;
  const result = await pool.query(
    `SELECT * FROM alerts WHERE user_id = $1`,
    [userId]
  );
  res.json(result.rows);
});


// complaint registration

// POST /api/complaints
app.post('/api/complaints', async (req, res) => {
  const { name, address, incident, date } = req.body;
  const result = await pool.query(
    `INSERT INTO complaints (name, address, incident, date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, address, incident, date]
  );
  res.json(result.rows[0]);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
