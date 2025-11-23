const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const areaRoutes = require('./areaRoutes');
const archivadorRoutes = require('./archivadorRoutes');
const documentoRoutes = require('./documentoRoutes');
const rolRoutes = require('./rolRoutes');
const auditRoutes = require('./auditRoutes');
const configRoutes = require('./configRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/areas', areaRoutes);
router.use('/archivadores', archivadorRoutes);
router.use('/documentos', documentoRoutes);
router.use('/roles', rolRoutes);
router.use('/audit', auditRoutes);
router.use('/config', configRoutes);
router.use('/reports', reportRoutes);
router.use('/prestamos', require('./prestamoRoutes'));

router.use('/tipos-documento', require('./tipoDocumentoRoutes'));

module.exports = router;
