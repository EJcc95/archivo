const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const createDocumentoValidator = [
  body('nombre_documento')
    .trim()
    .notEmpty().withMessage('El nombre del documento es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('asunto')
    .trim()
    .notEmpty().withMessage('El asunto es requerido'),
  body('fecha_documento')
    .notEmpty().withMessage('La fecha del documento es requerida')
    .isDate().withMessage('Debe ser una fecha válida'),
  body('numero_folios')
    .notEmpty().withMessage('El número de folios es requerido')
    .isInt({ min: 1 }).withMessage('Debe ser un número entero mayor a 0'),
  body('id_tipo_documento')
    .notEmpty().withMessage('El tipo de documento es requerido')
    .isInt().withMessage('ID inválido'),
  body('id_area_origen')
    .notEmpty().withMessage('El área de origen es requerida')
    .isInt().withMessage('ID inválido'),
  body('id_archivador')
    .optional()
    .isInt().withMessage('ID de archivador inválido'),
  validate
];

const updateDocumentoValidator = [
  body('nombre_documento')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('asunto')
    .optional()
    .trim(),
  body('fecha_documento')
    .optional()
    .isDate().withMessage('Debe ser una fecha válida'),
  body('numero_folios')
    .optional()
    .isInt({ min: 1 }).withMessage('Debe ser un número entero mayor a 0'),
  body('id_archivador')
    .optional()
    .isInt().withMessage('ID de archivador inválido'),
  validate
];

module.exports = {
  createDocumentoValidator,
  updateDocumentoValidator
};
