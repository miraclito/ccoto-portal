const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Ejecutar scraping (solo admin)
router.post('/run', authMiddleware, isAdmin, scraperController.runScraping);

// Obtener estadísticas de scraping
router.get('/stats', scraperController.getScrapingStats);

module.exports = router;
