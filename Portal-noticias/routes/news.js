const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas públicas
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, upload.single('image'), newsController.createNews);
router.put('/:id', authMiddleware, upload.single('image'), newsController.updateNews);
router.delete('/:id', authMiddleware, newsController.deleteNews);

module.exports = router;
