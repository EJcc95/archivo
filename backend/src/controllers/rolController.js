const rolService = require('../services/rolService');

class RolController {
  async createRol(req, res, next) {
    try {
      const rol = await rolService.createRol(req.body);
      res.status(201).json({ success: true, message: 'Rol creado exitosamente', data: rol });
    } catch (error) {
      next(error);
    }
  }

  async getAllRoles(req, res, next) {
    try {
      const roles = await rolService.getAllRoles();
      res.json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  async getRolById(req, res, next) {
    try {
      const rol = await rolService.getRolById(req.params.id);
      res.json({ success: true, data: rol });
    } catch (error) {
      next(error);
    }
  }

  async updateRol(req, res, next) {
    try {
      const rol = await rolService.updateRol(req.params.id, req.body);
      res.json({ success: true, message: 'Rol actualizado exitosamente', data: rol });
    } catch (error) {
      next(error);
    }
  }

  async deleteRol(req, res, next) {
    try {
      await rolService.deleteRol(req.params.id);
      res.json({ success: true, message: 'Rol eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async getAllPermissions(req, res, next) {
    try {
      const permissions = await rolService.getAllPermissions();
      res.json({ success: true, data: permissions });
    } catch (error) {
      next(error);
    }
  }

  async getUsersByRole(req, res, next) {
    try {
      const result = await rolService.getUsersByRole(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RolController();
