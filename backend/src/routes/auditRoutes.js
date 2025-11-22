const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Rutas protegidas solo para ADMIN
router.use(authMiddleware);
router.use(checkRole(['ADMIN']));

router.get('/', auditController.getAuditLogs);

module.exports = router;
