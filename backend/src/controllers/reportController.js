const reportService = require('../services/reportService');

class ReportController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentosByArea(req, res, next) {
    try {
      const data = await reportService.getDocumentosByArea();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentosByTipo(req, res, next) {
    try {
      const data = await reportService.getDocumentosByTipo();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentosByEstado(req, res, next) {
    try {
      const data = await reportService.getDocumentosByEstado();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUserActivity(req, res, next) {
    try {
      const data = await reportService.getUserActivity(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
