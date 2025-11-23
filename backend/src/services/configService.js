const { ConfiguracionSistema: Config } = require('../models');

class ConfigService {
  // Obtener solo el valor de una configuración
  async getConfig(key) {
    const config = await Config.findOne({ where: { clave: key } });
    return config ? config.valor : null;
  }

  // Obtener el objeto completo de configuración por clave
  async getConfigByKey(key) {
    return await Config.findOne({ where: { clave: key } });
  }

  // Obtener todas las configuraciones
  async getAllConfigs() {
    return await Config.findAll({
      order: [['clave', 'ASC']]
    });
  }

  // Crear o actualizar configuración (upsert)
  async setConfig(key, value, description = null) {
    const [config, created] = await Config.findOrCreate({
      where: { clave: key },
      defaults: { valor: value, descripcion: description }
    });

    if (!created) {
      await config.update({
        valor: value,
        descripcion: description !== null ? description : config.descripcion,
        fecha_modificacion: new Date()
      });
      await config.reload();
    }

    return config;
  }

  // Actualizar solo una configuración existente
  async updateConfig(key, value, description = null) {
    const config = await Config.findOne({ where: { clave: key } });

    if (!config) {
      return null;
    }

    await config.update({
      valor: value,
      descripcion: description !== null ? description : config.descripcion,
      fecha_modificacion: new Date()
    });

    await config.reload();
    return config;
  }

  // Eliminar configuración
  async deleteConfig(key) {
    const deleted = await Config.destroy({ where: { clave: key } });
    return deleted > 0;
  }
}

module.exports = new ConfigService();
