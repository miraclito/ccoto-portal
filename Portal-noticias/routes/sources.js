const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', sourceController.getSources);
router.post('/', sourceController.createSource);
router.put('/:id', sourceController.updateSource);
router.delete('/:id', sourceController.deleteSource);
router.post('/test', sourceController.testScraper);

module.exports = router;
