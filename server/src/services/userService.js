const { Usuario, Rol, Area, Organizacion } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');

const emailService = require('./emailService');
const crypto = require('crypto');

class UserService {

  async createUser(data) {
    // Verificar si el usuario o email ya existen
    const existingUser = await Usuario.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: data.email },
          { nombre_usuario: data.nombre_usuario }
        ]
      }
    });

    if (existingUser) {
      throw new Error('El email o nombre de usuario ya están registrados');
    }

    // Generar contraseña temporal
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(temporaryPassword);

    // Crear usuario
    const newUser = await Usuario.create({
      ...data,
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
      newUser.nombre_usuario,
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
    const allowedFields = ['nombres', 'apellidos', 'id_rol', 'id_area', 'estado'];

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
}

module.exports = new UserService();
