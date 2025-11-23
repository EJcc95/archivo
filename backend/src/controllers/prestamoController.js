const prestamoService = require('../services/prestamoService');

class PrestamoController {
  async createPrestamo(req, res, next) {
    try {
      const prestamo = await prestamoService.createPrestamo(req.body);
      res.status(201).json({ success: true, message: 'Préstamo registrado correctamente', data: prestamo });
    } catch (error) {
      next(error);
    }
  }

  async getAllPrestamos(req, res, next) {
    try {
      const prestamos = await prestamoService.getAllPrestamos(req.query);
      res.json({ success: true, data: prestamos });
    } catch (error) {
      next(error);
    }
  }

  async getPrestamoById(req, res, next) {
    try {
      const prestamo = await prestamoService.getPrestamoById(req.params.id);
      res.json({ success: true, data: prestamo });
    } catch (error) {
      next(error);
    }
  }

  async returnPrestamo(req, res, next) {
    try {
      const prestamo = await prestamoService.returnPrestamo(req.params.id, req.body);
      res.json({ success: true, message: 'Préstamo marcado como devuelto', data: prestamo });
    } catch (error) {
      next(error);
    }
  }

  async updatePrestamo(req, res, next) {
    try {
      const prestamo = await prestamoService.updatePrestamo(req.params.id, req.body);
      res.json({ success: true, message: 'Préstamo actualizado correctamente', data: prestamo });
    } catch (error) {
      next(error);
    }
  }

  async deletePrestamo(req, res, next) {
    try {
      await prestamoService.deletePrestamo(req.params.id);
      res.json({ success: true, message: 'Préstamo eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PrestamoController();
