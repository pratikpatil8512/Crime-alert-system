// routes/crimeRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authenticateToken = require('../middleware/authMiddleware');
const { createCrime, getNearbyCrimes, getHeatmap } = require('../controllers/crimeController');

// create crime (authenticated)
router.post('/', authenticateToken, createCrime);

// get nearby crimes
router.get('/nearby', authenticateToken, getNearbyCrimes);

// get heatmap
router.get('/heatmap', authenticateToken, getHeatmap);

module.exports = router;
