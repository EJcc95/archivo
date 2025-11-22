const configService = require('../services/configService');

class ConfigController {
  async getAllConfigs(req, res, next) {
    try {
      const configs = await configService.getAllConfigs();
      res.json({ success: true, data: configs });
    } catch (error) {
      next(error);
    }
  }

  async getConfig(req, res, next) {
    try {
      const value = await configService.getConfig(req.params.key);
      if (value === null) {
        return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
      }
      res.json({ success: true, data: { key: req.params.key, value } });
    } catch (error) {
      next(error);
    }
  }

  async setConfig(req, res, next) {
    try {
      const { key, value, description } = req.body;
      const config = await configService.setConfig(key, value, description);
      res.json({ success: true, message: 'Configuración guardada', data: config });
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
