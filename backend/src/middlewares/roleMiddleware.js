const logger = require('../config/logger');

/**
 * Middleware para verificar si el usuario tiene uno de los roles permitidos.
 * @param {string[]} allowedRoles - Array de nombres de roles permitidos (ej. ['ADMIN', 'USER'])
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.rol) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Rol no identificado.'
        });
      }

      const userRole = req.user.rol.toUpperCase();
      const roles = allowedRoles.map(role => role.toUpperCase());

      if (roles.includes(userRole)) {
        next();
      } else {
        logger.warn(`Acceso denegado a usuario ${req.user.email} (Rol: ${userRole}) a ruta protegida para ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción.'
        });
      }
    } catch (error) {
      logger.error(`Error en roleMiddleware: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Error interno al verificar permisos.'
      });
    }
  };
};

module.exports = checkRole;
