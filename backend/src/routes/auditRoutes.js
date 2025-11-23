const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');

// Rutas protegidas
router.use(authMiddleware);
router.use(checkPermission('system_admin'));
router.get('/logs', auditController.getAuditLogs);

module.exports = router;
