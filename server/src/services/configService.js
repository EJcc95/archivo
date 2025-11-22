const { ConfiguracionSistema: Config } = require('../models');

class ConfigService {
  async getConfig(key) {
    const config = await Config.findOne({ where: { clave: key } });
    return config ? config.valor : null;
  }

  async getAllConfigs() {
    return await Config.findAll();
  }

  async setConfig(key, value, description = null) {
    const [config, created] = await Config.findOrCreate({
      where: { clave: key },
      defaults: { valor: value, descripcion: description }
    });

    if (!created) {
      await config.update({ valor: value, descripcion: description || config.descripcion });
    }

    return config;
  }

  async deleteConfig(key) {
    const deleted = await Config.destroy({ where: { clave: key } });
    return deleted > 0;
  }
}

module.exports = new ConfigService();
