const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const {
  updateProfileValidator,
  changePasswordValidator,
  createUserValidator,
  updateUserValidator
} = require('../validators/userValidator');

// Rutas de perfil personal
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, updateProfileValidator, userController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidator, userController.changePassword);

// Rutas de administración (Solo ADMIN)
router.post('/', authenticate, checkRole(['Administrador']), createUserValidator, userController.createUser);
router.get('/', authenticate, checkRole(['Administrador']), userController.getAllUsers);
router.get('/:id', authenticate, checkRole(['Administrador']), userController.getUserById);
router.put('/:id', authenticate, checkRole(['Administrador']), updateUserValidator, userController.updateUser);
router.delete('/:id', authenticate, checkRole(['Administrador']), userController.deleteUser);
router.post('/:id/reset-password', authenticate, checkRole(['Administrador']), userController.resetPassword);

module.exports = router;
