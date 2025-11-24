const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
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

// Rutas de administración - requieren permiso users_admin
router.post('/', authenticate, checkPermission('users_admin'), createUserValidator, userController.createUser);
router.get('/', authenticate, checkPermission('users_admin'), userController.getAllUsers);
router.get('/:id', authenticate, checkPermission('users_admin'), userController.getUserById);
router.put('/:id', authenticate, checkPermission('users_admin'), updateUserValidator, userController.updateUser);
router.delete('/:id', authenticate, checkPermission('users_admin'), userController.deleteUser);
router.post('/:id/reset-password', authenticate, checkPermission('users_admin'), userController.resetPassword);

module.exports = router;
