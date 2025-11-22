const { Rol, Permiso, RolPermiso } = require('../models');

class RolService {
  async createRol(data) {
    const { nombre_rol, descripcion, permisos } = data;
    console.log('Creating Rol:', nombre_rol);

    const rol = await Rol.create({
      nombre_rol,
      descripcion
    });
    console.log('Rol created:', rol.id_rol);

    if (permisos && permisos.length > 0) {
      await rol.setPermisos(permisos);
    }

    console.log('Fetching created Rol...');
    return this.getRolById(rol.id_rol);
  }

  async getAllRoles() {
    return await Rol.findAll({
      include: [{
        model: Permiso,
        attributes: ['id_permiso', 'nombre_permiso']
      }]
    });
  }

  async getRolById(id) {
    const rol = await Rol.findByPk(id, {
      include: [{
        model: Permiso,
        attributes: ['id_permiso', 'nombre_permiso'],
        through: { attributes: [] } // No incluir tabla intermedia
      }]
    });

    if (!rol) throw new Error('Rol no encontrado');
    return rol;
  }

  async updateRol(id, data) {
    const { nombre_rol, descripcion, permisos } = data;
    const rol = await Rol.findByPk(id);

    if (!rol) throw new Error('Rol no encontrado');

    // Evitar modificar roles críticos si fuera necesario (ej. ADMIN)
    // if (rol.nombre_rol === 'ADMIN') throw new Error('No se puede modificar el rol ADMIN');

    await rol.update({ nombre_rol, descripcion });

    if (permisos) {
      await rol.setPermisos(permisos);
    }

    return this.getRolById(id);
  }

  async deleteRol(id) {
    const rol = await Rol.findByPk(id);
    if (!rol) throw new Error('Rol no encontrado');

    // Validar si hay usuarios asignados a este rol antes de borrar
    // const usersCount = await Usuario.count({ where: { id_rol: id } });
    // if (usersCount > 0) throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');

    await rol.destroy();
    return true;
  }
}

module.exports = new RolService();
