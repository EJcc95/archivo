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
router.post('/', checkRole(['Administrador']), createAreaValidator, areaController.createArea);
router.put('/:id', checkRole(['Administrador']), updateAreaValidator, areaController.updateArea);
router.delete('/:id', checkRole(['Administrador']), areaController.deleteArea);

module.exports = router;
