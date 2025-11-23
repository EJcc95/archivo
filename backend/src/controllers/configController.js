const configService = require('../services/configService');
const { validationResult } = require('express-validator');

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
  // Obtener todas las configuraciones
  async getAllConfigs(req, res, next) {
    try {
      const configs = await configService.getAllConfigs();
      const transformedConfigs = configs.map(transformConfig);
      res.json({ success: true, data: transformedConfigs });
    } catch (error) {
      next(error);
    }
  }

  // Obtener una configuración por clave
  async getConfig(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const config = await configService.getConfigByKey(req.params.key);
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }
      res.json({ success: true, data: transformConfig(config) });
    } catch (error) {
      next(error);
    }
  }

  // Crear o actualizar configuración (POST)
  async setConfig(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { key, value, description } = req.body;
      const config = await configService.setConfig(key, value, description);
      res.json({
        success: true,
        message: 'Configuración guardada exitosamente',
        data: transformConfig(config)
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar configuración existente (PUT)
  async updateConfig(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { value, description } = req.body;
      const config = await configService.updateConfig(req.params.key, value, description);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: transformConfig(config)
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar configuración
  async deleteConfig(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const success = await configService.deleteConfig(req.params.key);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }
      res.json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConfigController();
