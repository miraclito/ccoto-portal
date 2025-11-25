// routes/scrapers.js
const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Ejecutar scraping de TODOS los sitios (solo admin)
router.post('/run', authMiddleware, isAdmin, scraperController.runAllScrapers);

// Ejecutar un scraper específico (opcional, por si luego lo usas)
router.post('/run/:scraperName', authMiddleware, isAdmin, scraperController.runSpecificScraper);

// Obtener estadísticas de scraping + conteos (totalNews, totalScraped, etc.)
router.get('/stats', scraperController.getStats);

// Listar scrapers disponibles (no es obligatorio, pero ya que tienes listScrapers)
router.get('/list', scraperController.listScrapers);

module.exports = router;
