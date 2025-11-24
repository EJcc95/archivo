const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const { createRolValidator, updateRolValidator } = require('../validators/rolValidator');

// Todas las rutas protegidas - requieren permiso users_admin
router.use(authMiddleware);
router.use(checkPermission('users_admin'));

router.get('/permissions/all', rolController.getAllPermissions);
router.post('/', createRolValidator, rolController.createRol);
router.get('/', rolController.getAllRoles);
router.get('/:id', rolController.getRolById);
router.get('/:id/users', rolController.getUsersByRole);
router.put('/:id', updateRolValidator, rolController.updateRol);
router.delete('/:id', rolController.deleteRol);

module.exports = router;
