const authService = require('../services/authService');
const logger = require('../config/logger');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    }

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result
    });
  } catch (error) {
    logger.error(`Login fallido para ${req.body.email}: ${error.message}`);
    res.status(401).json({ success: false, message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token requerido' });
    }

    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user?.id, refreshToken);
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip;

    await authService.requestPasswordReset(email, ipAddress);

    // Siempre respondemos éxito por seguridad
    res.json({
      success: true,
      message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'
    });
  } catch (error) {
    logger.error(`Error en requestPasswordReset: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token y nueva contraseña requeridos' });
    }

    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword
};
