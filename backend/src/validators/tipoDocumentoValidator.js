const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createTipoDocumentoValidator = [
  body('nombre_tipo')
    .exists().withMessage('El nombre del tipo de documento es requerido')
    .notEmpty().withMessage('El nombre del tipo de documento no puede estar vacío')
    .isString().withMessage('El nombre del tipo de documento debe ser texto')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder los 100 caracteres')
    .trim(),
  validate
];

const updateTipoDocumentoValidator = [
  param('id')
    .isInt().withMessage('El ID debe ser un número entero'),
  body('nombre_tipo')
    .optional()
    .notEmpty().withMessage('El nombre del tipo de documento no puede estar vacío')
    .isString().withMessage('El nombre del tipo de documento debe ser texto')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder los 100 caracteres')
    .trim(),
  validate
];

module.exports = {
  createTipoDocumentoValidator,
  updateTipoDocumentoValidator
};
