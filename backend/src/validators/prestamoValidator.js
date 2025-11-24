const { body, query } = require('express-validator');
const validateRequest = require('../middlewares/validate');

exports.createPrestamoValidator = [
  body('id_archivador')
    .notEmpty().withMessage('El ID del archivador es obligatorio')
    .isInt().withMessage('El ID del archivador debe ser un número entero'),
  body('id_area_solicitante')
    .notEmpty().withMessage('El ID del área solicitante es obligatorio')
    .isInt().withMessage('El ID del área debe ser un número entero'),
  body('fecha_devolucion_esperada')
    .notEmpty().withMessage('La fecha de devolución esperada es obligatoria')
    .isDate().withMessage('La fecha de devolución debe ser una fecha válida'),
  body('motivo')
    .notEmpty().withMessage('El motivo del préstamo es obligatorio')
    .isLength({ min: 5 }).withMessage('El motivo debe tener al menos 5 caracteres'),
  validateRequest
];

exports.updatePrestamoValidator = [
  body('fecha_devolucion_esperada')
    .optional()
    .isDate().withMessage('La fecha de devolución debe ser una fecha válida'),
  body('motivo')
    .optional()
    .isString().withMessage('El motivo debe ser texto')
    .isLength({ min: 5 }).withMessage('El motivo debe tener al menos 5 caracteres'),
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto'),
  validateRequest
];

exports.returnPrestamoValidator = [
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto'),
  validateRequest
];
