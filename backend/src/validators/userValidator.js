const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const updateProfileValidator = [
  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 75 }).withMessage('El nombre debe tener entre 2 y 75 caracteres')
    .escape(),
  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .escape(),
  validate
];

const changePasswordValidator = [
  body('oldPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La nueva contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('La nueva contraseña debe contener al menos una letra minúscula')
    .matches(/\d/).withMessage('La nueva contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La nueva contraseña debe contener al menos un carácter especial')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('La nueva contraseña no puede ser igual a la actual');
      }
      return true;
    }),
  validate
];

const createUserValidator = [
  body('nombre_usuario')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('nombres')
    .trim()
    .notEmpty().withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 75 }).withMessage('Los nombres deben tener entre 2 y 75 caracteres')
    .escape(),
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .escape(),
  body('id_rol')
    .notEmpty().withMessage('El rol es requerido')
    .isInt().withMessage('El ID del rol debe ser un número entero'),
  body('id_area')
    .optional()
    .isInt().withMessage('El ID del área debe ser un número entero'),
  validate
];

const updateUserValidator = [
  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 75 }).withMessage('Los nombres deben tener entre 2 y 75 caracteres')
    .escape(),
  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .escape(),
  body('id_rol')
    .optional()
    .isInt().withMessage('El ID del rol debe ser un número entero'),
  body('id_area')
    .optional()
    .isInt().withMessage('El ID del área debe ser un número entero'),
  body('estado')
    .optional()
    .isBoolean().withMessage('El estado debe ser un valor booleano'),
  validate
];

module.exports = {
  updateProfileValidator,
  changePasswordValidator,
  createUserValidator,
  updateUserValidator
};
