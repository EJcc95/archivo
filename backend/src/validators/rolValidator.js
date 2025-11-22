const { body, param } = require('express-validator');
const { Rol } = require('../models');
const validate = require('../middlewares/validate');

const createRolValidator = [
  body('nombre_rol')
    .trim()
    .notEmpty().withMessage('El nombre del rol es obligatorio')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .custom(async (value) => {
      const existing = await Rol.findOne({ where: { nombre_rol: value } });
      if (existing) {
        throw new Error('El nombre del rol ya está en uso');
      }
      return true;
    }),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres'),
  body('permisos')
    .optional()
    .isArray().withMessage('Los permisos deben ser un array de IDs'),
  validate
];

const updateRolValidator = [
  param('id').isInt().withMessage('ID de rol inválido'),
  body('nombre_rol')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre del rol no puede estar vacío')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .custom(async (value, { req }) => {
      const existing = await Rol.findOne({ where: { nombre_rol: value } });
      if (existing && existing.id_rol !== parseInt(req.params.id)) {
        throw new Error('El nombre del rol ya está en uso');
      }
      return true;
    }),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres'),
  body('permisos')
    .optional()
    .isArray().withMessage('Los permisos deben ser un array de IDs'),
  validate
];

module.exports = {
  createRolValidator,
  updateRolValidator
};
