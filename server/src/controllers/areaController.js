const areaService = require('../services/areaService');

class AreaController {

  async createArea(req, res, next) {
    try {
      const area = await areaService.createArea(req.body);
      res.status(201).json({ success: true, message: 'Área creada exitosamente', data: area });
    } catch (error) {
      next(error);
    }
  }

  async getAllAreas(req, res, next) {
    try {
      const result = await areaService.getAllAreas(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAreaById(req, res, next) {
    try {
      const area = await areaService.getAreaById(req.params.id);
      res.json({ success: true, data: area });
    } catch (error) {
      next(error);
    }
  }

  async updateArea(req, res, next) {
    try {
      const area = await areaService.updateArea(req.params.id, req.body);
      res.json({ success: true, message: 'Área actualizada exitosamente', data: area });
    } catch (error) {
      next(error);
    }
  }

  async deleteArea(req, res, next) {
    try {
      await areaService.deleteArea(req.params.id);
      res.json({ success: true, message: 'Área eliminada (desactivada) correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AreaController();
