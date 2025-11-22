const { validationResult } = require('express-validator');

/**
 * Middleware genérico para manejar resultados de validación.
 * Si hay errores, responde con 400 y un formato estandarizado.
 * Si no hay errores, pasa al siguiente middleware.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
    value: err.value // Opcional: devolver el valor que falló (cuidado con datos sensibles)
  }));

  return res.status(400).json({
    success: false,
    message: 'Error de validación en los datos enviados',
    errors: extractedErrors
  });
};

module.exports = validate;
