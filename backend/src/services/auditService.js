const { Auditoria, Usuario } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');

class AuditService {
  /**
   * Registrar una acción en la auditoría
   * @param {number} userId - ID del usuario que realiza la acción
   * @param {string} accion - Descripción breve de la acción (ej. 'LOGIN', 'CREATE_USER')
   * @param {string} detalles - Detalles adicionales (JSON string o texto)
   * @param {string} ipAddress - Dirección IP
   * @param {string} userAgent - User Agent del navegador
   */
  async logAction(userId, accion, detalles, ipAddress, userAgent, tabla_afectada = null, id_registro_afectado = null) {
    console.log('AUDIT LOGGING:', userId, accion);
    try {
      await Auditoria.create({
        id_usuario: userId,
        accion,
        tabla_afectada: tabla_afectada || 'N/A',
        id_registro_afectado: id_registro_afectado || 0,
        detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
        ip_address: ipAddress,
        user_agent: userAgent,
        fecha_hora: new Date()
      });
    } catch (error) {
      console.error('Error registrando auditoría:', error);
      fs.writeFileSync('audit-error.log', JSON.stringify(error, null, 2));
    }
  }

  async getAuditLogs(query = {}) {
    const { page = 1, limit = 20, search = '', id_usuario, fecha_inicio, fecha_fin } = query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { accion: { [Op.like]: `%${search}%` } },
        { detalles: { [Op.like]: `%${search}%` } }
      ];
    }

    if (id_usuario) whereClause.id_usuario = id_usuario;

    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_hora = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
      };
    } else if (fecha_inicio) {
      whereClause.fecha_hora = { [Op.gte]: new Date(fecha_inicio) };
    }

    const { count, rows } = await Auditoria.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Usuario, attributes: ['nombre_usuario', 'email'] }
      ],
      order: [['fecha_hora', 'DESC']]
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      logs: rows
    };
  }
}

module.exports = new AuditService();
