const express = require('express');
const router = express.Router();
const tipoDocumentoController = require('../controllers/tipoDocumentoController');
const authenticate = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createTipoDocumentoValidator, updateTipoDocumentoValidator } = require('../validators/tipoDocumentoValidator');

// Public (Authenticated)
router.get('/', authenticate, tipoDocumentoController.getAllTipos);
router.get('/:id', authenticate, tipoDocumentoController.getById);

// Protected - require tipos_write permission
router.post('/', authenticate, checkPermission('tipos_write'), createTipoDocumentoValidator, tipoDocumentoController.create);
router.put('/:id', authenticate, checkPermission('tipos_write'), updateTipoDocumentoValidator, tipoDocumentoController.update);
router.delete('/:id', authenticate, checkPermission('tipos_write'), tipoDocumentoController.delete);

module.exports = router;
