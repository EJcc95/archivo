const logger = require('../config/logger');

/**
 * Middleware para verificar si el usuario tiene un permiso específico.
 * @param {string} requiredPermission - Código del permiso requerido (ej. 'reports_access')
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Usuario no autenticado.'
        });
      }

      // Admin siempre tiene acceso (fallback por seguridad)
      if (req.user.rol === 'Administrador' || req.user.rol === 'Administrador') {
        return next();
      }

      const userPermissions = req.user.permisos || [];

      if (userPermissions.includes(requiredPermission)) {
        next();
      } else {
        logger.warn(`Acceso denegado a usuario ${req.user.email} (Rol: ${req.user.rol}) a ruta que requiere: ${requiredPermission}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción.'
        });
      }
    } catch (error) {
      logger.error(`Error en permissionMiddleware: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Error interno al verificar permisos.'
      });
    }
  };
};

module.exports = checkPermission;
