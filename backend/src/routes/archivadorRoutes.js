const express = require('express');
const router = express.Router();
const archivadorController = require('../controllers/archivadorController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { createArchivadorValidator, updateArchivadorValidator } = require('../validators/archivadorValidator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas para usuarios autenticados (lectura)
router.get('/', archivadorController.getAllArchivadores);
router.get('/:id', archivadorController.getArchivadorById);

// Rutas protegidas para ADMIN (escritura)
// Nota: Podríamos permitir a otros roles crear archivadores si fuera necesario, 
// pero por ahora restringimos a ADMIN según patrón anterior.
router.post('/', checkRole(['ADMIN']), createArchivadorValidator, archivadorController.createArchivador);
router.put('/:id', checkRole(['ADMIN']), updateArchivadorValidator, archivadorController.updateArchivador);
router.delete('/:id', checkRole(['ADMIN']), archivadorController.deleteArchivador);
router.put('/:id/restore', checkRole(['ADMIN']), archivadorController.restoreArchivador);

module.exports = router;
