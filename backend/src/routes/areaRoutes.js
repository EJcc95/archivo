const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { createAreaValidator, updateAreaValidator } = require('../validators/areaValidator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas para usuarios autenticados (lectura)
router.get('/', areaController.getAllAreas);
router.get('/:id', areaController.getAreaById);

// Rutas protegidas para ADMIN (escritura)
router.post('/', checkRole(['ADMINISTRADOR']), createAreaValidator, areaController.createArea);
router.put('/:id', checkRole(['ADMINISTRADOR']), updateAreaValidator, areaController.updateArea);
router.delete('/:id', checkRole(['ADMINISTRADOR']), areaController.deleteArea);

module.exports = router;
