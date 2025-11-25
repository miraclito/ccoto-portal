// routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Todas las rutas de reportes solo para admin
router.get('/overview', authMiddleware, isAdmin, reportController.getOverviewStats);
router.get('/by-category', authMiddleware, isAdmin, reportController.getNewsByCategory);
router.get('/time-series', authMiddleware, isAdmin, reportController.getNewsTimeSeries);

module.exports = router;
