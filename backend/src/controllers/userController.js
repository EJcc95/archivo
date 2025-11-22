const userService = require('../services/userService');

class UserController {

  // --- Métodos de Perfil Personal ---

  async getProfile(req, res, next) {
    try {
      // req.user.id_usuario viene del authMiddleware
      const user = await userService.getProfile(req.user.id_usuario);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id_usuario, req.body);
      res.json({ success: true, message: 'Perfil actualizado', data: user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await userService.changePassword(req.user.id_usuario, oldPassword, newPassword);
      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  // --- Métodos de Administración (CRUD) ---

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente. Se ha enviado un correo con las credenciales.',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ success: true, message: 'Usuario actualizado', data: user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.json({ success: true, message: 'Usuario eliminado (desactivado) correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
