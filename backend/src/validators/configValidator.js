const { body, param } = require('express-validator');

const configValidators = {
  // Validaciones para crear una nueva configuración
  create: [
    body('key')
      .trim()
      .notEmpty()
      .withMessage('La clave es requerida')
      .matches(/^[A-Z0-9_]+$/)
      .withMessage('La clave debe contener solo mayúsculas, números y guiones bajos')
      .isLength({ max: 100 })
      .withMessage('La clave no puede exceder 100 caracteres'),

    body('value')
      .trim()
      .notEmpty()
      .withMessage('El valor es requerido'),

    body('description')
      .optional()
      .trim()
  ],

  // Validaciones para actualizar una configuración existente
  update: [
    param('key')
      .trim()
      .notEmpty()
      .withMessage('La clave es requerida'),

    body('value')
      .trim()
      .notEmpty()
      .withMessage('El valor es requerido'),

    body('description')
      .optional()
      .trim()
  ],

  // Validaciones para obtener/eliminar por clave
  getByKey: [
    param('key')
      .trim()
      .notEmpty()
      .withMessage('La clave es requerida')
  ]
};

module.exports = configValidators;
