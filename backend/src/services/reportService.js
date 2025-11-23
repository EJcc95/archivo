const { Documento, Archivador, Area, Usuario, TipoDocumento, EstadoDocumento } = require('../models');
const { sequelize } = require('../config/database');

class ReportService {
  async getDashboardStats() {
    const totalDocumentos = await Documento.count({ where: { eliminado: false } });
    const totalArchivadores = await Archivador.count({ where: { eliminado: false } });
    const totalAreas = await Area.count();
    const totalUsuarios = await Usuario.count({ where: { estado: true } });

    // Obtener documentos por estado
    const documentsByState = await Documento.findAll({
      attributes: [
        [sequelize.col('EstadoDocumento.nombre_estado'), 'estado'],
        [sequelize.fn('COUNT', sequelize.col('Documento.id_documento')), 'count']
      ],
      include: [{
        model: EstadoDocumento,
        attributes: []
      }],
      where: { eliminado: false },
      group: ['EstadoDocumento.id_estado', 'EstadoDocumento.nombre_estado'],
      raw: true
    });

    return {
      totalDocumentos,
      totalArchivadores,
      totalAreas,
      totalUsuarios,
      documentsByState
    };
  }

  async getDocumentosByArea() {
    return await Documento.findAll({
      attributes: [
        [sequelize.col('AreaOrigen.nombre_area'), 'area'],
        [sequelize.fn('COUNT', sequelize.col('Documento.id_documento')), 'cantidad']
      ],
      include: [{
        model: Area,
        as: 'areaOrigen',
        attributes: []
      }],
      where: { eliminado: false },
      group: ['AreaOrigen.id_area', 'AreaOrigen.nombre_area'],
      raw: true
    });
  }

  async getDocumentosByTipo() {
    return await Documento.findAll({
      attributes: [
        [sequelize.col('TipoDocumento.nombre_tipo'), 'tipo'],
        [sequelize.fn('COUNT', sequelize.col('Documento.id_documento')), 'cantidad']
      ],
      include: [{
        model: TipoDocumento,
        attributes: []
      }],
      where: { eliminado: false },
      group: ['TipoDocumento.id_tipo_documento', 'TipoDocumento.nombre_tipo'],
      raw: true
    });
  }

  async getDocumentosByEstado() {
    return await Documento.findAll({
      attributes: [
        [sequelize.col('EstadoDocumento.nombre_estado'), 'estado'],
        [sequelize.fn('COUNT', sequelize.col('Documento.id_documento')), 'cantidad']
      ],
      include: [{
        model: EstadoDocumento,
        attributes: []
      }],
      where: { eliminado: false },
      group: ['EstadoDocumento.id_estado', 'EstadoDocumento.nombre_estado'],
      raw: true
    });
  }

  async getUserActivity(options = {}) {
    const { limit = 10 } = options;

    // Get most recent user activity from audit logs
    const activity = await sequelize.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.nombres,
        u.apellidos,
        MAX(a.fecha_hora) as ultima_actividad,
        COUNT(a.id_auditoria) as total_acciones
      FROM usuarios u
      INNER JOIN auditoria a ON u.id_usuario = a.id_usuario
      WHERE u.estado = 1
      GROUP BY u.id_usuario, u.nombre_usuario, u.nombres, u.apellidos
      ORDER BY ultima_actividad DESC
      LIMIT :limit
    `, {
      replacements: { limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    return activity.map(item => ({
      id_usuario: item.id_usuario,
      usuario: {
        nombre_usuario: item.nombre_usuario,
        nombres: item.nombres,
        apellidos: item.apellidos
      },
      ultima_actividad: item.ultima_actividad,
      total_acciones: parseInt(item.total_acciones)
    }));
  }
}

module.exports = new ReportService();
