const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Rutas protegidas (solo admin)
router.post('/', authMiddleware, isAdmin, categoryController.createCategory);
router.put('/:id', authMiddleware, isAdmin, categoryController.updateCategory);
router.delete('/:id', authMiddleware, isAdmin, categoryController.deleteCategory);

module.exports = router;
