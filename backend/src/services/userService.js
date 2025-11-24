const { Usuario, Rol, Area, Organizacion } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');

const emailService = require('./emailService');
const crypto = require('crypto');

class UserService {

  /**
   * Genera un nombre de usuario único basado en nombres y apellidos
   */
  async generateUniqueUsername(nombres, apellidos) {
    // Normalizar y limpiar los textos
    const cleanNombres = nombres.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const cleanApellidos = apellidos.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    // Generar username base: primera letra del nombre + apellido
    const primeraLetra = cleanNombres.charAt(0);
    const primerApellido = cleanApellidos.split(' ')[0];
    let baseUsername = primeraLetra + primerApellido;

    // Remover caracteres especiales y espacios
    baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');

    // Verificar si el username existe
    let username = baseUsername;
    let counter = 1;

    while (await Usuario.findOne({ where: { nombre_usuario: username } })) {
      username = baseUsername + counter;
      counter++;
    }

    return username;
  }

  async createUser(data) {
    // Verificar si el email ya existe
    const existingEmail = await Usuario.findOne({
      where: { email: data.email }
    });

    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    // Generar nombre de usuario único si no se proporciona
    let nombre_usuario = data.nombre_usuario;
    if (!nombre_usuario || nombre_usuario.trim() === '') {
      nombre_usuario = await this.generateUniqueUsername(data.nombres, data.apellidos);
    } else {
      // Verificar que el nombre de usuario no exista
      const existingUser = await Usuario.findOne({
        where: { nombre_usuario: nombre_usuario }
      });
      if (existingUser) {
        throw new Error('El nombre de usuario ya está registrado');
      }
    }

    // Generar contraseña temporal
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(temporaryPassword);

    // Crear usuario
    const newUser = await Usuario.create({
      ...data,
      nombre_usuario,
      password: hashedPassword,
      estado: true
    });

    // Obtener nombre del rol para el email
    const role = await Rol.findByPk(data.id_rol);
    const roleName = role ? role.nombre_rol : 'Sin Rol';

    // Enviar email de bienvenida
    // No bloqueamos la respuesta si falla el email, pero lo logueamos
    emailService.sendWelcomeEmail(
      newUser.email,
      newUser.email,
      `${newUser.nombres} ${newUser.apellidos}`,
      temporaryPassword,
      roleName
    ).catch(err => console.error('Error enviando email bienvenida:', err));

    // Retornar usuario sin password
    const { password, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  }

  async getAllUsers(query = {}) {
    const { page = 1, limit = 10, search = '' } = query;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { nombres: { [Op.like]: `%${search}%` } },
        { apellidos: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { nombre_usuario: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Usuario.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] },
      include: [
        { model: Rol, attributes: ['nombre_rol'] },
        { model: Area, attributes: ['nombre_area'] }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users: rows
    };
  }

  async getUserById(userId) {
    const user = await Usuario.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Rol, attributes: ['id_rol', 'nombre_rol'] },
        { model: Area, attributes: ['id_area', 'nombre_area', 'siglas'] },
        { model: Organizacion, attributes: ['nombre', 'ruc'] }
      ]
    });

    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async updateUser(userId, data) {
    const user = await Usuario.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Campos permitidos para admin
    const allowedFields = ['nombres', 'apellidos', 'email', 'id_rol', 'id_area', 'estado'];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = data[key];
      }
    });

    await user.save();
    return this.getUserById(userId);
  }

  async deleteUser(userId) {
    const user = await Usuario.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Soft delete (cambiar estado a false o usar deletedAt si estuviera configurado, 
    // aquí usamos estado según modelo)
    user.estado = false;
    await user.save();

    return true;
  }

  // Métodos de perfil personal (existentes)
  async getProfile(userId) {
    return this.getUserById(userId);
  }

  async updateProfile(userId, data) {
    const user = await Usuario.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Solo permitir actualizar ciertos campos
    const allowedFields = ['nombres', 'apellidos'];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = data[key];
      }
    });

    await user.save();
    return this.getProfile(userId);
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await Usuario.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) throw new Error('La contraseña actual es incorrecta');

    user.password = await hashPassword(newPassword);
    await user.save();

    return true;
  }

  /**
   * Resetear contraseña de usuario (Solo ADMIN)
   * Genera nueva contraseña y la envía por email
   */
  async resetUserPassword(userId) {
    const user = await Usuario.findByPk(userId, {
      include: [
        { model: Rol, attributes: ['nombre_rol'] }
      ]
    });

    if (!user) throw new Error('Usuario no encontrado');

    // Generar nueva contraseña temporal
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    // Enviar email con nueva contraseña
    const roleName = user.Rol ? user.Rol.nombre_rol : 'Sin Rol';

    try {
      await emailService.sendAdminPasswordResetEmail(
        user.email,
        user.email,
        `${user.nombres} ${user.apellidos}`,
        newPassword,
        roleName
      );
    } catch (err) {
      console.error('Error enviando email de reseteo:', err);
      throw new Error('No se pudo enviar el email con la nueva contraseña');
    }

    return true;
  }
}

module.exports = new UserService();
