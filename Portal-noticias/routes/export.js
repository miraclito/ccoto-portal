const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Rutas protegidas (solo admin puede exportar)
router.get('/news', authMiddleware, isAdmin, exportController.exportNewsToCSV);
router.get('/categories', authMiddleware, isAdmin, exportController.exportCategoriesToCSV);
router.get('/stats', authMiddleware, isAdmin, exportController.exportStatsToCSV);

module.exports = router;
