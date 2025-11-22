const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('El usuario o email es requerido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  validate
];

const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty().withMessage('El refresh token es requerido')
    .isString().withMessage('Formato de token inválido'),
  validate
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  validate
];

const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('El token es requerido'),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),
  validate
];

module.exports = {
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
