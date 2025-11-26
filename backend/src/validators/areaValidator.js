const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const createAreaValidator = [
  body('nombre_area')
    .trim()
    .notEmpty().withMessage('El nombre del área es requerido')
    .isLength({ min: 3, max: 255 }).withMessage('El nombre del área debe tener entre 3 y 255 caracteres'),
  body('siglas')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Las siglas no pueden exceder 50 caracteres'),
  body('id_organizacion')
    .optional()
    .isInt().withMessage('El ID de la organización debe ser un número entero'),
  validate
];

const updateAreaValidator = [
  body('nombre_area')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('El nombre del área debe tener entre 3 y 255 caracteres'),
  body('siglas')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Las siglas no pueden exceder 50 caracteres'),
  body('estado')
    .optional()
    .isBoolean().withMessage('El estado debe ser un valor booleano'),
  validate
];

module.exports = {
  createAreaValidator,
  updateAreaValidator
};
