const { Area, Organizacion } = require('../models');
const { Op } = require('sequelize');

class AreaService {

  async createArea(data) {
    // Verificar si ya existe un área con el mismo nombre en la organización
    const existingArea = await Area.findOne({
      where: {
        nombre_area: data.nombre_area,
        id_organizacion: data.id_organizacion || 1 // Default org
      }
    });

    if (existingArea) {
      throw new Error('Ya existe un área con este nombre en la organización');
    }

    const area = await Area.create({
      ...data,
      estado: true
    });

    return area;
  }

  async getAllAreas(query = {}) {
    const { page = 1, limit = 10, search = '', estado } = query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { nombre_area: { [Op.like]: `%${search}%` } },
        { siglas: { [Op.like]: `%${search}%` } }
      ];
    }

    if (estado !== undefined) {
      whereClause.estado = estado === 'true';
    }

    const { count, rows } = await Area.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Organizacion, attributes: ['nombre'] }
      ],
      order: [['nombre_area', 'ASC']]
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      areas: rows
    };
  }

  async getAreaById(id) {
    const area = await Area.findByPk(id, {
      include: [{ model: Organizacion, attributes: ['nombre'] }]
    });

    if (!area) throw new Error('Área no encontrada');
    return area;
  }

  async updateArea(id, data) {
    const area = await Area.findByPk(id);
    if (!area) throw new Error('Área no encontrada');

    await area.update(data);
    return area;
  }

  async deleteArea(id) {
    const area = await Area.findByPk(id);
    if (!area) throw new Error('Área no encontrada');

    // Soft delete (desactivar)
    // Nota: Si se requiere hard delete, usar area.destroy()
    // Aquí usamos el campo 'estado' según el modelo
    area.estado = false;
    await area.save();

    return true;
  }
}

module.exports = new AreaService();
