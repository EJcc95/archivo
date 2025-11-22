const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Rutas protegidas (ADMIN y tal vez otros roles)
router.use(authMiddleware);
// router.use(checkRole(['ADMIN', 'USER'])); // Permitir a todos los autenticados ver reportes básicos?
// Por ahora solo ADMIN para consistencia, o abrir si es necesario.
router.use(checkRole(['ADMIN']));

router.get('/dashboard', reportController.getDashboardStats);
router.get('/by-area', reportController.getDocumentosByArea);
router.get('/by-tipo', reportController.getDocumentosByTipo);
router.get('/by-estado', reportController.getDocumentosByEstado);

module.exports = router;
