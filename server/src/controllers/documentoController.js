const documentoService = require('../services/documentoService');

class DocumentoController {
  async createDocumento(req, res, next) {
    try {
      console.log('Create Documento Request:');
      console.log('Body:', req.body);
      console.log('File:', req.file);

      // req.file contiene el archivo subido por multer (si existe)
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
      const documento = await documentoService.updateDocumento(req.params.id, req.body, req.user.id_usuario);
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

  async downloadDocumento(req, res, next) {
    try {
      const filePath = await documentoService.getFilePath(req.params.id);
      res.download(filePath);
    } catch (error) {
      next(error);
    }
  }

  async viewDocumento(req, res, next) {
    try {
      const filePath = await documentoService.getFilePath(req.params.id);
      // res.sendFile envía el archivo con Content-Disposition: inline por defecto para PDFs si no se especifica attachment
      // También podemos forzarlo:
      res.sendFile(filePath, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentoController();
