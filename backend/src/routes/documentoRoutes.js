const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authenticateForView } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { createDocumentoValidator, updateDocumentoValidator } = require('../validators/documentoValidator');
const { upload } = require('../config/upload');

// Lectura - most routes use standard auth
router.get('/', authMiddleware, documentoController.getAllDocumentos);
router.get('/:id/download', authMiddleware, documentoController.downloadDocumento);
router.get('/:id/view', authenticateForView, documentoController.viewDocumento); // Special auth for iframe
router.get('/:id', authMiddleware, documentoController.getDocumentoById);

// Escritura (Admin o usuarios con permisos, por ahora restringimos creación a Admin/User según lógica de negocio)
// Asumimos que cualquier usuario autenticado puede registrar documentos, pero solo Admin puede borrar físicamente.
router.post('/', authMiddleware, upload.single('archivo'), createDocumentoValidator, documentoController.createDocumento);
router.put('/:id', authMiddleware, upload.single('archivo'), updateDocumentoValidator, documentoController.updateDocumento);

// Papelera
router.delete('/:id', authMiddleware, documentoController.softDeleteDocumento); // Mover a papelera
router.put('/:id/restore', authMiddleware, documentoController.restoreDocumento); // Restaurar

// Eliminación física (Solo Admin)
router.delete('/:id/destroy', authMiddleware, checkRole(['ADMINISTRADOR']), documentoController.hardDeleteDocumento);

module.exports = router;

// Escritura (Admin o usuarios con permisos, por ahora restringimos creación a Admin/User según lógica de negocio)
// Asumimos que cualquier usuario autenticado puede registrar documentos, pero solo Admin puede borrar físicamente.
router.post('/', upload.single('archivo'), createDocumentoValidator, documentoController.createDocumento);
router.put('/:id', upload.single('archivo'), updateDocumentoValidator, documentoController.updateDocumento);

// Papelera
router.delete('/:id', documentoController.softDeleteDocumento); // Mover a papelera
router.put('/:id/restore', documentoController.restoreDocumento); // Restaurar

// Eliminación física (Solo Admin)
router.delete('/:id/destroy', checkRole(['ADMINISTRADOR']), documentoController.hardDeleteDocumento);

module.exports = router;
