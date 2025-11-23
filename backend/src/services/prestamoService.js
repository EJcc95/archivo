const { PrestamoArchivador, Archivador, Usuario } = require('../models');
const { Op } = require('sequelize');

class PrestamoService {
  async createPrestamo(data) {
    const { id_archivador, id_usuario_solicitante, fecha_devolucion_esperada, motivo, observaciones } = data;

    // Verificar si el archivador existe y no está prestado
    const archivador = await Archivador.findByPk(id_archivador);
    if (!archivador) throw new Error('Archivador no encontrado');

    // Verificar si ya está prestado (opcional, dependiendo de reglas de negocio)
    // Por ahora asumimos que se puede prestar si está disponible físicamente

    return await PrestamoArchivador.create({
      id_archivador,
      id_usuario_solicitante,
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
        { model: Usuario, as: 'solicitante', attributes: ['nombres', 'apellidos', 'nombre_usuario'] }
      ],
      order: [['fecha_prestamo', 'DESC']]
    });
  }

  async getPrestamoById(id) {
    const prestamo = await PrestamoArchivador.findByPk(id, {
      include: [
        { model: Archivador, attributes: ['nombre_archivador', 'descripcion'] },
        { model: Usuario, as: 'solicitante', attributes: ['nombres', 'apellidos', 'nombre_usuario'] }
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

    // Solo permitir editar si está activo (opcional, dependiendo de reglas)
    // if (prestamo.estado !== 'Activo') throw new Error('No se puede editar un préstamo inactivo');

    return await prestamo.update({
      fecha_devolucion_esperada: data.fecha_devolucion_esperada,
      motivo: data.motivo,
      observaciones: data.observaciones
    });
  }

  async deletePrestamo(id) {
    const prestamo = await this.getPrestamoById(id);

    // Opcional: Validar si se puede eliminar (ej. solo si no ha sido devuelto o si es muy reciente)

    await prestamo.destroy();
    return true;
  }
}

module.exports = new PrestamoService();
