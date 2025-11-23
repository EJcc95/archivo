const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createPrestamoValidator, returnPrestamoValidator } = require('../validators/prestamoValidator');

// Rutas protegidas
router.use(authMiddleware);

// Listar préstamos (requiere permiso de ver préstamos)
router.get('/', checkPermission('prestamos_ver'), prestamoController.getAllPrestamos);

// Obtener préstamo por ID
router.get('/:id', checkPermission('prestamos_ver'), prestamoController.getPrestamoById);

// Crear nuevo préstamo
router.post('/', checkPermission('prestamos_crear'), createPrestamoValidator, prestamoController.createPrestamo);

// Registrar devolución
router.post('/:id/return', checkPermission('prestamos_editar'), returnPrestamoValidator, prestamoController.returnPrestamo);

// Actualizar préstamo
router.put('/:id', checkPermission('prestamos_editar'), createPrestamoValidator, prestamoController.updatePrestamo);

// Eliminar préstamo
router.delete('/:id', checkPermission('prestamos_eliminar'), prestamoController.deletePrestamo);

module.exports = router;
