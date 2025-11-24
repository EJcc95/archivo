const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createAreaValidator, updateAreaValidator } = require('../validators/areaValidator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas para usuarios autenticados (lectura)
router.get('/', areaController.getAllAreas);
router.get('/:id', areaController.getAreaById);

// Rutas protegidas - requieren permisos específicos
router.post('/', checkPermission('areas_write'), createAreaValidator, areaController.createArea);
router.put('/:id', checkPermission('areas_write'), updateAreaValidator, areaController.updateArea);
router.delete('/:id', checkPermission('areas_admin'), areaController.deleteArea);

module.exports = router;
