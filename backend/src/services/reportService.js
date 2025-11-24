const { Documento, Archivador, Area, Usuario, TipoDocumento, EstadoDocumento } = require('../models');
const { sequelize } = require('../config/database');

class ReportService {
  async getDashboardStats() {
    const totalDocumentos = await Documento.count({ where: { eliminado: false } });
    const totalArchivadores = await Archivador.count({ where: { eliminado: false } });
    const totalAreas = await Area.count();
    const totalUsuarios = await Usuario.count({ where: { estado: true } });

    // Obtener documentos por estado usando raw SQL
    let documentsByState = [];
    try {
      const result = await sequelize.query(`
        SELECT 
          ed.nombre_estado as nombre,
          CAST(COUNT(d.id_documento) AS UNSIGNED) as value
        FROM documentos d
        INNER JOIN estados_documento ed ON d.id_estado = ed.id_estado
        WHERE d.eliminado = 0
        GROUP BY ed.id_estado, ed.nombre_estado
        ORDER BY ed.nombre_estado ASC
      `, { type: sequelize.QueryTypes.SELECT });
      
      documentsByState = (result || []).map(row => ({
        nombre: row.nombre || 'Sin estado',
        value: parseInt(row.value) || 0
      }));
    } catch (error) {
      console.error('Error in getDashboardStats documentsByState:', error.message);
      documentsByState = [];
    }

    return {
      totalDocumentos,
      totalArchivadores,
      totalAreas,
      totalUsuarios,
      documentsByState
    };
  }

  async getDocumentosByArea() {
    try {
      const result = await sequelize.query(`
        SELECT 
          a.nombre_area as name,
          CAST(COUNT(d.id_documento) AS UNSIGNED) as value
        FROM documentos d
        INNER JOIN areas a ON d.id_area_origen = a.id_area
        WHERE d.eliminado = 0
        GROUP BY a.id_area, a.nombre_area
        ORDER BY a.nombre_area ASC
      `, { type: sequelize.QueryTypes.SELECT });
      
      return (result || []).map(row => ({
        name: row.name || 'Sin área',
        value: parseInt(row.value) || 0
      }));
    } catch (error) {
      console.error('Error in getDocumentosByArea:', error.message);
      throw new Error('No se pudo obtener documentos por área: ' + error.message);
    }
  }

  async getDocumentosByTipo() {
    try {
      const result = await sequelize.query(`
        SELECT 
          td.nombre_tipo as name,
          CAST(COUNT(d.id_documento) AS UNSIGNED) as value
        FROM documentos d
        INNER JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo_documento
        WHERE d.eliminado = 0
        GROUP BY td.id_tipo_documento, td.nombre_tipo
        ORDER BY td.nombre_tipo ASC
      `, { type: sequelize.QueryTypes.SELECT });
      
      return (result || []).map(row => ({
        name: row.name || 'Sin tipo',
        value: parseInt(row.value) || 0
      }));
    } catch (error) {
      console.error('Error in getDocumentosByTipo:', error.message);
      throw new Error('No se pudo obtener documentos por tipo: ' + error.message);
    }
  }

  async getDocumentosByEstado() {
    try {
      const result = await sequelize.query(`
        SELECT 
          ed.nombre_estado as name,
          CAST(COUNT(d.id_documento) AS UNSIGNED) as value
        FROM documentos d
        INNER JOIN estados_documento ed ON d.id_estado = ed.id_estado
        WHERE d.eliminado = 0
        GROUP BY ed.id_estado, ed.nombre_estado
        ORDER BY ed.nombre_estado ASC
      `, { type: sequelize.QueryTypes.SELECT });
      
      return (result || []).map(row => ({
        name: row.name || 'Sin estado',
        value: parseInt(row.value) || 0
      }));
    } catch (error) {
      console.error('Error in getDocumentosByEstado:', error.message);
      throw new Error('No se pudo obtener documentos por estado: ' + error.message);
    }
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
