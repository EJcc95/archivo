const express = require('express');
const router = express.Router();
const archivadorController = require('../controllers/archivadorController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createArchivadorValidator, updateArchivadorValidator } = require('../validators/archivadorValidator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas para usuarios autenticados (lectura)
router.get('/', archivadorController.getAllArchivadores);
router.get('/:id', archivadorController.getArchivadorById);

// Rutas protegidas - requieren permiso arch_write
router.post('/', checkPermission('arch_write'), createArchivadorValidator, archivadorController.createArchivador);
router.put('/:id', checkPermission('arch_write'), updateArchivadorValidator, archivadorController.updateArchivador);

// Rutas protegidas - requieren permiso arch_admin
router.delete('/:id', checkPermission('arch_admin'), archivadorController.deleteArchivador);
router.put('/:id/restore', checkPermission('arch_admin'), archivadorController.restoreArchivador);

module.exports = router;
