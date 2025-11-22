const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado o formato inválido.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado.',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw err;
    }

  } catch (error) {
    logger.warn(`Intento de acceso no autorizado: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }
};

// Special auth middleware for viewing files (accepts token in query param for iframe support)
const authenticateForView = (req, res, next) => {
  try {
    let token;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      // Fallback to query param for iframe viewing
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado.',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw err;
    }

  } catch (error) {
    logger.warn(`Intento de acceso no autorizado: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }
};

module.exports = authenticate;
module.exports.authenticateForView = authenticateForView;
