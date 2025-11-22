const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');

// Rutas protegidas
router.use(authMiddleware);
router.use(checkPermission('reports_access'));

router.get('/dashboard', reportController.getDashboardStats);
router.get('/by-area', reportController.getDocumentosByArea);
router.get('/by-tipo', reportController.getDocumentosByTipo);
router.get('/by-estado', reportController.getDocumentosByEstado);

module.exports = router;
