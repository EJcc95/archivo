const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { createDocumentoValidator, updateDocumentoValidator } = require('../validators/documentoValidator');
const { upload } = require('../config/upload');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Lectura
router.get('/', documentoController.getAllDocumentos);
router.get('/:id', documentoController.getDocumentoById);
router.get('/:id/download', documentoController.downloadDocumento);
router.get('/:id/view', documentoController.viewDocumento);

// Escritura (Admin o usuarios con permisos, por ahora restringimos creación a Admin/User según lógica de negocio)
// Asumimos que cualquier usuario autenticado puede registrar documentos, pero solo Admin puede borrar físicamente.
router.post('/', upload.single('archivo'), createDocumentoValidator, documentoController.createDocumento);
router.put('/:id', updateDocumentoValidator, documentoController.updateDocumento);

// Papelera
router.delete('/:id', documentoController.softDeleteDocumento); // Mover a papelera
router.put('/:id/restore', documentoController.restoreDocumento); // Restaurar

// Eliminación física (Solo Admin)
router.delete('/:id/destroy', checkRole(['ADMIN']), documentoController.hardDeleteDocumento);

module.exports = router;
