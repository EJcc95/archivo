const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const configValidator = require('../validators/configValidator');

// Rutas protegidas - requieren permiso system_admin
router.use(authMiddleware);
router.use(checkPermission('system_admin'));

// CRUD de configuraciones
router.get('/', configController.getAllConfigs);
router.get('/:key', configValidator.getByKey, configController.getConfig);
router.post('/', configValidator.create, configController.setConfig);
router.put('/:key', configValidator.update, configController.updateConfig);
router.delete('/:key', configValidator.getByKey, configController.deleteConfig);

module.exports = router;
