const documentoService = require('../services/documentoService');
const fs = require('fs');
const path = require('path');
const { Documento } = require('../models');

class DocumentoController {
  async createDocumento(req, res, next) {
    try {
      console.log('Create Documento Request:');
      console.log('Body:', req.body);
      console.log('File:', req.file);

      const documento = await documentoService.createDocumento(req.body, req.file, req.user.id_usuario);
      res.status(201).json({ success: true, message: 'Documento registrado exitosamente', data: documento });
    } catch (error) {
      next(error);
    }
  }

  async getAllDocumentos(req, res, next) {
    try {
      const result = await documentoService.getAllDocumentos(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentoById(req, res, next) {
    try {
      const documento = await documentoService.getDocumentoById(req.params.id);
      res.json({ success: true, data: documento });
    } catch (error) {
      next(error);
    }
  }

  async updateDocumento(req, res, next) {
    try {
      const documento = await documentoService.updateDocumento(req.params.id, req.body, req.user.id_usuario, req.file);
      res.json({ success: true, message: 'Documento actualizado', data: documento });
    } catch (error) {
      next(error);
    }
  }

  async softDeleteDocumento(req, res, next) {
    try {
      await documentoService.softDeleteDocumento(req.params.id, req.user.id_usuario);
      res.json({ success: true, message: 'Documento enviado a la papelera' });
    } catch (error) {
      next(error);
    }
  }

  async restoreDocumento(req, res, next) {
    try {
      await documentoService.restoreDocumento(req.params.id);
      res.json({ success: true, message: 'Documento restaurado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async hardDeleteDocumento(req, res, next) {
    try {
      await documentoService.hardDeleteDocumento(req.params.id);
      res.json({ success: true, message: 'Documento eliminado permanentemente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DESCARGA OPTIMIZADA CON STREAMING
   * - No carga el archivo completo en memoria
   * - Usa streams para archivos grandes
   * - Maneja errores de archivo no encontrado
   * - Incluye headers de cache
   */
  async downloadDocumento(req, res, next) {
    try {
      const id = req.params.id;
      
      // Query optimizada - solo campos necesarios
      const documento = await Documento.findOne({
        where: { id_documento: id, eliminado: false },
        attributes: ['id_documento', 'nombre_documento', 'ruta_archivo_digital'],
        raw: true // Devuelve objeto plano, sin overhead de Sequelize
      });

      if (!documento || !documento.ruta_archivo_digital) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      const filePath = path.join(__dirname, '../../uploads', documento.ruta_archivo_digital);

      // Verificar existencia del archivo
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'El archivo físico no existe en el servidor'
        });
      }

      // Obtener stats del archivo
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Headers optimizados
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(documento.nombre_documento)}.pdf"`);
      
      // Headers de cache (1 hora)
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('ETag', `"${stats.mtime.getTime()}-${fileSize}"`);

      // Streaming del archivo (eficiente para archivos grandes)
      const fileStream = fs.createReadStream(filePath, {
        highWaterMark: 64 * 1024 // Buffer de 64KB (óptimo para PDFs)
      });

      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error al transmitir el archivo'
          });
        }
      });

      // Pipe del stream al response
      fileStream.pipe(res);

    } catch (error) {
      next(error);
    }
  }

  /**
   * VISUALIZACIÓN OPTIMIZADA EN NAVEGADOR
   * - Similar al download pero con Content-Disposition: inline
   * - Permite ver PDFs sin descargar
   */
  async viewDocumento(req, res, next) {
    try {
      const id = req.params.id;
      
      // Query optimizada
      const documento = await Documento.findOne({
        where: { id_documento: id, eliminado: false },
        attributes: ['id_documento', 'nombre_documento', 'ruta_archivo_digital', 'numero_consultas'],
        raw: true
      });

      if (!documento || !documento.ruta_archivo_digital) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      const filePath = path.join(__dirname, '../../uploads', documento.ruta_archivo_digital);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'El archivo físico no existe en el servidor'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Headers para visualización
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento.nombre_documento)}.pdf"`);
      
      // Headers de cache (30 minutos para viewer)
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.setHeader('ETag', `"${stats.mtime.getTime()}-${fileSize}"`);

      // Accept-Ranges para soporte de reproducción parcial
      res.setHeader('Accept-Ranges', 'bytes');

      // Incrementar contador de consultas (async, no bloquea respuesta)
      Documento.increment('numero_consultas', {
        where: { id_documento: id }
      }).catch(err => console.error('Error incrementando consultas:', err));

      // Streaming del archivo
      const fileStream = fs.createReadStream(filePath, {
        highWaterMark: 64 * 1024
      });

      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error al transmitir el archivo'
          });
        }
      });

      fileStream.pipe(res);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentoController();