const { Usuario, RefreshToken, PasswordResetToken, PasswordResetAttempt, Rol, Area, Organizacion } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require('../utils/jwt');
const emailService = require('./emailService');
const auditService = require('./auditService');
const logger = require('../config/logger');
const crypto = require('crypto');
const { Op } = require('sequelize');

class AuthService {

  async login(email, password, ipAddress, userAgent) {
    // Buscar usuario
    const user = await Usuario.findOne({
      where: { email, estado: true },
      include: [{ model: Rol }]
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar tokens
    const accessToken = generateAccessToken({
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.Rol.nombre_rol
    });

    const { token: refreshToken, hash: tokenHash } = generateRefreshToken();

    // Guardar refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    await RefreshToken.create({
      id_usuario: user.id_usuario,
      token: refreshToken,
      token_hash: tokenHash,
      fecha_expiracion: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Registrar auditoría
    await auditService.logAction(user.id_usuario, 'LOGIN', 'Inicio de sesión exitoso', ipAddress, userAgent);

    return {
      user: {
        id: user.id_usuario,
        nombre: user.nombres,
        apellido: user.apellidos,
        email: user.email,
        rol: user.Rol.nombre_rol
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token) {
    const storedToken = await RefreshToken.findOne({
      where: { token, revocado: false, usado: false }
    });

    if (!storedToken) {
      throw new Error('Refresh token inválido o reutilizado');
    }

    if (new Date() > storedToken.fecha_expiracion) {
      throw new Error('Refresh token expirado');
    }

    // Marcar como usado (Rotación de tokens)
    storedToken.usado = true;
    storedToken.fecha_uso = new Date();
    await storedToken.save();

    // Obtener usuario
    const user = await Usuario.findByPk(storedToken.id_usuario, {
      include: [{ model: Rol }]
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Generar nuevos tokens
    const accessToken = generateAccessToken({
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.Rol.nombre_rol
    });

    const { token: newRefreshToken, hash: newTokenHash } = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      id_usuario: user.id_usuario,
      token: newRefreshToken,
      token_hash: newTokenHash,
      fecha_expiracion: expiresAt,
      token_anterior_id: storedToken.id_refresh_token
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, token) {
    if (token) {
      await RefreshToken.update(
        { revocado: true, fecha_revocacion: new Date() },
        { where: { token } }
      );
    }
    return true;
  }

  async requestPasswordReset(email, ipAddress) {
    const user = await Usuario.findOne({ where: { email, estado: true } });

    // Registrar intento
    await PasswordResetAttempt.create({
      email,
      ip_address: ipAddress,
      exito: !!user,
      motivo_fallo: user ? null : 'Usuario no encontrado'
    });

    if (!user) return false; // Por seguridad no decimos si existe o no

    // Generar token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60); // 1 hora

    await PasswordResetToken.create({
      id_usuario: user.id_usuario,
      token,
      email,
      fecha_expiracion: expiresAt
    });

    // Enviar email
    await emailService.sendPasswordResetEmail(email, user.nombres, token);
    return true;
  }

  async resetPassword(token, newPassword) {
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        usado: false,
        fecha_expiracion: { [Op.gt]: new Date() }
      }
    });

    if (!resetToken) {
      throw new Error('Token inválido o expirado');
    }

    const user = await Usuario.findByPk(resetToken.id_usuario);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar password
    user.password = await hashPassword(newPassword);
    await user.save();

    // Marcar token como usado
    resetToken.usado = true;
    resetToken.fecha_uso = new Date();
    await resetToken.save();

    // Revocar todas las sesiones activas por seguridad
    await RefreshToken.update(
      { revocado: true, fecha_revocacion: new Date() },
      { where: { id_usuario: user.id_usuario, revocado: false } }
    );

    return true;
  }
}

module.exports = new AuthService();
