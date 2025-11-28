const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas públicas/protegidas para usuarios
router.post('/upload', authMiddleware, upload.single('image'), paymentController.uploadPayment);
router.get('/my-payments', authMiddleware, paymentController.getMyPayments);

// Rutas para admin
router.get('/', authMiddleware, isAdmin, paymentController.getPayments);
router.put('/:id/process', authMiddleware, isAdmin, paymentController.processPayment);

module.exports = router;
