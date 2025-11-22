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
router.post('/', authenticate, checkRole(['ADMIN']), createUserValidator, userController.createUser);
router.get('/', authenticate, checkRole(['ADMIN']), userController.getAllUsers);
router.get('/:id', authenticate, checkRole(['ADMIN']), userController.getUserById);
router.put('/:id', authenticate, checkRole(['ADMIN']), updateUserValidator, userController.updateUser);
router.delete('/:id', authenticate, checkRole(['ADMIN']), userController.deleteUser);

module.exports = router;
