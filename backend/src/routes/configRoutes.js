const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Rutas protegidas solo para ADMIN
router.use(authMiddleware);
router.use(checkRole(['Administrador']));

router.get('/', configController.getAllConfigs);
router.get('/:key', configController.getConfig);
router.post('/', configController.setConfig);
router.delete('/:key', configController.deleteConfig);

module.exports = router;
