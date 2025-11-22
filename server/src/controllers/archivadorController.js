const archivadorService = require('../services/archivadorService');

class ArchivadorController {

  async createArchivador(req, res, next) {
    try {
      // req.user.id_usuario viene del authMiddleware
      const archivador = await archivadorService.createArchivador(req.body, req.user.id_usuario);
      res.status(201).json({ success: true, message: 'Archivador creado exitosamente', data: archivador });
    } catch (error) {
      next(error);
    }
  }

  async getAllArchivadores(req, res, next) {
    try {
      const result = await archivadorService.getAllArchivadores(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getArchivadorById(req, res, next) {
    try {
      const archivador = await archivadorService.getArchivadorById(req.params.id);
      res.json({ success: true, data: archivador });
    } catch (error) {
      next(error);
    }
  }

  async updateArchivador(req, res, next) {
    try {
      const archivador = await archivadorService.updateArchivador(req.params.id, req.body, req.user.id_usuario);
      res.json({ success: true, message: 'Archivador actualizado exitosamente', data: archivador });
    } catch (error) {
      next(error);
    }
  }

  async deleteArchivador(req, res, next) {
    try {
      await archivadorService.deleteArchivador(req.params.id, req.user.id_usuario);
      res.json({ success: true, message: 'Archivador eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async restoreArchivador(req, res, next) {
    try {
      await archivadorService.restoreArchivador(req.params.id);
      res.json({ success: true, message: 'Archivador restaurado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArchivadorController();
