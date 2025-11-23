const express = require('express');
const router = express.Router();
const tipoDocumentoController = require('../controllers/tipoDocumentoController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { createTipoDocumentoValidator, updateTipoDocumentoValidator } = require('../validators/tipoDocumentoValidator');

// Public (Authenticated)
router.get('/', authenticate, tipoDocumentoController.getAllTipos);
router.get('/:id', authenticate, tipoDocumentoController.getById);

// Admin only
router.post('/', authenticate, checkRole(['Administrador']), createTipoDocumentoValidator, tipoDocumentoController.create);
router.put('/:id', authenticate, checkRole(['Administrador']), updateTipoDocumentoValidator, tipoDocumentoController.update);
router.delete('/:id', authenticate, checkRole(['Administrador']), tipoDocumentoController.delete);

module.exports = router;
