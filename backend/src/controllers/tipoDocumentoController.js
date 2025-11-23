const tipoDocumentoService = require('../services/tipoDocumentoService');

class TipoDocumentoController {
  async getAllTipos(req, res, next) {
    try {
      const tipos = await tipoDocumentoService.getAllTipos();
      res.json({
        success: true,
        data: tipos
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const tipo = await tipoDocumentoService.getById(req.params.id);
      res.json({
        success: true,
        data: tipo
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const tipo = await tipoDocumentoService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Tipo de documento creado exitosamente',
        data: tipo
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const tipo = await tipoDocumentoService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Tipo de documento actualizado exitosamente',
        data: tipo
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await tipoDocumentoService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Tipo de documento eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TipoDocumentoController();
