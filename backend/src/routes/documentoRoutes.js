const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authenticateForView } = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createDocumentoValidator, updateDocumentoValidator } = require('../validators/documentoValidator');
const { upload } = require('../config/upload');

// Lectura - requieren permiso docs_read
router.get('/', authMiddleware, checkPermission('docs_read'), documentoController.getAllDocumentos);
router.get('/:id/download', authMiddleware, checkPermission('docs_read'), documentoController.downloadDocumento);
router.get('/:id/view', authenticateForView, checkPermission('docs_read'), documentoController.viewDocumento);
router.get('/:id', authMiddleware, checkPermission('docs_read'), documentoController.getDocumentoById);

// Escritura - requieren permiso docs_create
router.post('/', authMiddleware, checkPermission('docs_create'), upload.single('archivo'), createDocumentoValidator, documentoController.createDocumento);

// Edición - requieren permiso docs_edit
router.put('/:id', authMiddleware, checkPermission('docs_edit'), upload.single('archivo'), updateDocumentoValidator, documentoController.updateDocumento);

// Eliminación lógica - requieren permiso docs_delete
router.delete('/:id', authMiddleware, checkPermission('docs_delete'), documentoController.softDeleteDocumento);
router.put('/:id/restore', authMiddleware, checkPermission('docs_delete'), documentoController.restoreDocumento);

// Eliminación física - requieren permiso docs_delete
router.delete('/:id/destroy', authMiddleware, checkPermission('docs_delete'), documentoController.hardDeleteDocumento);

module.exports = router;
