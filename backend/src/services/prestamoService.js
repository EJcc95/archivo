const { PrestamoArchivador, Archivador, Area } = require('../models');
const { Op } = require('sequelize');

class PrestamoService {
  async createPrestamo(data) {
    const { id_archivador, id_area_solicitante, fecha_devolucion_esperada, motivo, observaciones } = data;

    // Verificar si el archivador existe
    const archivador = await Archivador.findByPk(id_archivador);
    if (!archivador) throw new Error('Archivador no encontrado');

    // Verificar si el área existe
    const area = await Area.findByPk(id_area_solicitante);
    if (!area) throw new Error('Área no encontrada');

    return await PrestamoArchivador.create({
      id_archivador,
      id_area_solicitante,
      fecha_devolucion_esperada,
      motivo,
      observaciones,
      estado: 'Activo'
    });
  }

  async getAllPrestamos(query) {
    const { estado } = query;
    const where = {};
    if (estado) where.estado = estado;

    return await PrestamoArchivador.findAll({
      where,
      include: [
        { model: Archivador, attributes: ['nombre_archivador', 'descripcion'] },
        { model: Area, as: 'areaSolicitante', attributes: ['nombre_area'] }
      ],
      order: [['fecha_prestamo', 'DESC']]
    });
  }

  async getPrestamoById(id) {
    const prestamo = await PrestamoArchivador.findByPk(id, {
      include: [
        { model: Archivador, attributes: ['nombre_archivador', 'descripcion'] },
        { model: Area, as: 'areaSolicitante', attributes: ['nombre_area'] }
      ]
    });
    if (!prestamo) throw new Error('Préstamo no encontrado');
    return prestamo;
  }

  async returnPrestamo(id, data) {
    const prestamo = await this.getPrestamoById(id);
    if (prestamo.estado === 'Devuelto') throw new Error('El préstamo ya ha sido devuelto');

    return await prestamo.update({
      estado: 'Devuelto',
      fecha_devolucion_real: new Date(),
      observaciones: data.observaciones ? `${prestamo.observaciones || ''}\nDevolución: ${data.observaciones}` : prestamo.observaciones
    });
  }

  async updatePrestamo(id, data) {
    const prestamo = await this.getPrestamoById(id);

    return await prestamo.update({
      fecha_devolucion_esperada: data.fecha_devolucion_esperada,
      motivo: data.motivo,
      observaciones: data.observaciones
    });
  }

  async deletePrestamo(id) {
    const prestamo = await this.getPrestamoById(id);
    await prestamo.destroy();
    return true;
  }
}

module.exports = new PrestamoService();
