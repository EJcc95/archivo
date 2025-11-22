const { Archivador, Area, TipoDocumento, Usuario } = require('../models');
const { Op } = require('sequelize');

class ArchivadorService {

  async createArchivador(data, userId) {
    // Verificar duplicado de nombre
    const existing = await Archivador.findOne({
      where: { nombre_archivador: data.nombre_archivador }
    });

    if (existing) {
      throw new Error('Ya existe un archivador con este nombre');
    }

    const archivador = await Archivador.create({
      ...data,
      fecha_creacion: new Date(),
      id_usuario_creacion: userId,
      estado: 'Abierto',
      eliminado: false
    });

    return archivador;
  }

  async getAllArchivadores(query = {}) {
    const { page = 1, limit = 10, search = '', id_area, estado } = query;
    const offset = (page - 1) * limit;

    const whereClause = { eliminado: false };

    if (search) {
      whereClause[Op.or] = [
        { nombre_archivador: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } },
        { ubicacion_fisica: { [Op.like]: `%${search}%` } }
      ];
    }

    if (id_area) whereClause.id_area_propietaria = id_area;
    if (estado) whereClause.estado = estado;

    const { count, rows } = await Archivador.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Area, attributes: ['nombre_area'] },
        { model: TipoDocumento, attributes: ['nombre_tipo'] },
        { model: Usuario, as: 'UsuarioCreacion', attributes: ['nombre_usuario'] }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      archivadores: rows
    };
  }

  async getArchivadorById(id) {
    const archivador = await Archivador.findOne({
      where: { id_archivador: id, eliminado: false },
      include: [
        { model: Area, attributes: ['id_area', 'nombre_area'] },
        { model: TipoDocumento, attributes: ['id_tipo_documento', 'nombre_tipo'] },
        { model: Usuario, as: 'UsuarioCreacion', attributes: ['nombre_usuario'] },
        { model: Usuario, as: 'UsuarioModificacion', attributes: ['nombre_usuario'] }
      ]
    });

    if (!archivador) throw new Error('Archivador no encontrado');
    return archivador;
  }

  async updateArchivador(id, data, userId) {
    const archivador = await Archivador.findOne({
      where: { id_archivador: id, eliminado: false }
    });

    if (!archivador) throw new Error('Archivador no encontrado');

    await archivador.update({
      ...data,
      id_usuario_modificacion: userId,
      fecha_modificacion: new Date()
    });

    return this.getArchivadorById(id);
  }

  async deleteArchivador(id, userId) {
    const archivador = await Archivador.findOne({
      where: { id_archivador: id, eliminado: false }
    });

    if (!archivador) throw new Error('Archivador no encontrado');

    // Soft delete
    await archivador.update({
      eliminado: true,
      fecha_eliminacion: new Date(),
      id_usuario_eliminacion: userId
    });

    return true;
  }

  async restoreArchivador(id) {
    const archivador = await Archivador.findByPk(id);

    if (!archivador) throw new Error('Archivador no encontrado');

    await archivador.update({
      eliminado: false,
      fecha_eliminacion: null,
      id_usuario_eliminacion: null
    });

    return true;
  }
}

module.exports = new ArchivadorService();
