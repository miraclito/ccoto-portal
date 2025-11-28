const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Middleware para verificar si es Admin o Premium
const isPremiumOrAdmin = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'premium') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere plan Premium o Admin.' });
    }
};

router.use(authMiddleware, isPremiumOrAdmin);

router.get('/stats', reportController.getStats);
router.get('/prediction', reportController.getPrediction);
router.get('/wordcloud', reportController.getWordCloud);

// Rutas legacy (si existen)
router.get('/overview', isAdmin, reportController.getStats);

module.exports = router;
