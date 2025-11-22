const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');
const {
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

router.post('/login', loginValidator, authController.login);
router.post('/refresh', refreshTokenValidator, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', forgotPasswordValidator, authController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

module.exports = router;
