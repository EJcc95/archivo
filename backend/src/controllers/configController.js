const configService = require('../services/configService');

// Transform database field names (Spanish) to API field names (English)
const transformConfig = (config) => {
  if (!config) return null;

  return {
    key: config.clave,
    value: config.valor,
    description: config.descripcion,
    created_at: config.fecha_modificacion,
    updated_at: config.fecha_modificacion
  };
};

class ConfigController {
  async getAllConfigs(req, res, next) {
    try {
      const configs = await configService.getAllConfigs();
      const transformedConfigs = configs.map(transformConfig);
      res.json({ success: true, data: transformedConfigs });
    } catch (error) {
      next(error);
    }
  }

  async getConfig(req, res, next) {
    try {
      const config = await configService.getConfigByKey(req.params.key);
      if (!config) {
        return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
      }
      res.json({ success: true, data: transformConfig(config) });
    } catch (error) {
      next(error);
    }
  }

  async setConfig(req, res, next) {
    try {
      const { key, value, description } = req.body;
      const config = await configService.setConfig(key, value, description);
      res.json({ success: true, message: 'Configuración guardada', data: transformConfig(config) });
    } catch (error) {
      next(error);
    }
  }

  async deleteConfig(req, res, next) {
    try {
      const success = await configService.deleteConfig(req.params.key);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
      }
      res.json({ success: true, message: 'Configuración eliminada' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConfigController();
