const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createPrestamoValidator, updatePrestamoValidator, returnPrestamoValidator } = require('../validators/prestamoValidator');

// Rutas protegidas
router.use(authMiddleware);

// Listar préstamos (requiere permiso de solicitar o aprobar)
router.get('/', (req, res, next) => {
  const userPermissions = req.user?.permisos || [];
  if (userPermissions.includes('prestamos_request') || 
      userPermissions.includes('prestamos_approve') || 
      userPermissions.includes('prestamos_admin')) {
    return next();
  }
  res.status(403).json({ success: false, message: 'No autorizado' });
}, prestamoController.getAllPrestamos);

// Obtener préstamo por ID
router.get('/:id', (req, res, next) => {
  const userPermissions = req.user?.permisos || [];
  if (userPermissions.includes('prestamos_request') || 
      userPermissions.includes('prestamos_approve') || 
      userPermissions.includes('prestamos_admin')) {
    return next();
  }
  res.status(403).json({ success: false, message: 'No autorizado' });
}, prestamoController.getPrestamoById);

// Crear nuevo préstamo
router.post('/', checkPermission('prestamos_request'), createPrestamoValidator, prestamoController.createPrestamo);

// Registrar devolución
router.post('/:id/return', checkPermission('prestamos_approve'), returnPrestamoValidator, prestamoController.returnPrestamo);

// Actualizar préstamo
router.put('/:id', (req, res, next) => {
  const userPermissions = req.user?.permisos || [];
  if (userPermissions.includes('prestamos_approve') || 
      userPermissions.includes('prestamos_admin')) {
    return next();
  }
  res.status(403).json({ success: false, message: 'No autorizado' });
}, updatePrestamoValidator, prestamoController.updatePrestamo);

// Eliminar préstamo
router.delete('/:id', checkPermission('prestamos_admin'), prestamoController.deletePrestamo);

module.exports = router;
