const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const createArchivadorValidator = [
  body('nombre_archivador')
    .trim()
    .notEmpty().withMessage('El nombre del archivador es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres'),
  body('id_area_propietaria')
    .notEmpty().withMessage('El área propietaria es requerida')
    .isInt().withMessage('El ID del área debe ser un número entero'),
  body('id_tipo_documento_contenido')
    .notEmpty().withMessage('El tipo de documento contenido es requerido')
    .isInt().withMessage('El ID del tipo de documento debe ser un número entero'),
  body('ubicacion_fisica')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La ubicación física no puede exceder 255 caracteres'),
  validate
];

const updateArchivadorValidator = [
  body('nombre_archivador')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres'),
  body('id_area_propietaria')
    .optional()
    .isInt().withMessage('El ID del área debe ser un número entero'),
  body('id_tipo_documento_contenido')
    .optional()
    .isInt().withMessage('El ID del tipo de documento debe ser un número entero'),
  body('ubicacion_fisica')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La ubicación física no puede exceder 255 caracteres'),
  body('estado')
    .optional()
    .isIn(['Abierto', 'Cerrado', 'En Custodia']).withMessage('Estado inválido'),
  validate
];

module.exports = {
  createArchivadorValidator,
  updateArchivadorValidator
};
