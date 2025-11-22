const { Documento, Archivador, Area, TipoDocumento, Usuario } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { STORAGE_DIR } = require('../config/upload');

class DocumentoService {

  // Función auxiliar para calcular hash y mover archivo (CAS)
  async _processFile(file) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(file.path);

      stream.on('error', err => reject(err));
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => {
        const fileHash = hash.digest('hex');
        const subDir = fileHash.substring(0, 2);
        const targetDir = path.join(STORAGE_DIR, subDir);
        const targetPath = path.join(targetDir, `${fileHash}${path.extname(file.originalname)}`);

        // Crear subdirectorio si no existe
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Mover archivo de temp a storage (si no existe ya)
        if (!fs.existsSync(targetPath)) {
          fs.rename(file.path, targetPath, (err) => {
            if (err) reject(err);
            else resolve({ hash: fileHash, path: targetPath, relativePath: path.join('storage', subDir, `${fileHash}${path.extname(file.originalname)}`) });
          });
        } else {
          // Si ya existe, borrar el temporal y usar el existente (Deduplicación)
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error borrando temp file:', err);
            resolve({ hash: fileHash, path: targetPath, relativePath: path.join('storage', subDir, `${fileHash}${path.extname(file.originalname)}`) });
          });
        }
      });
    });
  }

  async createDocumento(data, file, userId) {
    console.log('Service createDocumento file:', file);
    let rutaArchivo = null;

    if (file) {
      console.log('Processing file...');
      const processed = await this._processFile(file);
      rutaArchivo = processed.relativePath;
    }

    const documento = await Documento.create({
      ...data,
      ruta_archivo_digital: rutaArchivo,
      id_usuario_registro: userId,
      fecha_registro_sistema: new Date(),
      eliminado: false,
      numero_consultas: 0
    });

    return documento;
  }

  async getAllDocumentos(query = {}) {
    const { page = 1, limit = 10, search = '', id_archivador, eliminado } = query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Filtro de eliminado (Soft Delete)
    // Si eliminado es 'true', mostramos papelera. Si no, mostramos activos.
    whereClause.eliminado = eliminado === 'true';

    if (search) {
      whereClause[Op.or] = [
        { nombre_documento: { [Op.like]: `%${search}%` } },
        { asunto: { [Op.like]: `%${search}%` } }
      ];
    }

    if (id_archivador) whereClause.id_archivador = id_archivador;

    const { count, rows } = await Documento.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: TipoDocumento, attributes: ['nombre_tipo'] },
        { model: Area, as: 'areaOrigen', attributes: ['nombre_area'] },
        { model: Archivador, attributes: ['nombre_archivador'] }
      ],
      order: [['fecha_registro_sistema', 'DESC']]
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      documentos: rows
    };
  }

  async getDocumentoById(id) {
    const documento = await Documento.findByPk(id, {
      include: [
        { model: TipoDocumento, attributes: ['nombre_tipo'] },
        { model: Area, as: 'areaOrigen', attributes: ['nombre_area'] },
        { model: Area, as: 'areaDestino', attributes: ['nombre_area'] },
        { model: Archivador, attributes: ['nombre_archivador', 'ubicacion_fisica'] },
        { model: Usuario, as: 'usuarioRegistro', attributes: ['nombre_usuario'] }
      ]
    });

    if (!documento) throw new Error('Documento no encontrado');

    // Incrementar contador de consultas
    await documento.increment('numero_consultas');

    return documento;
  }

  async updateDocumento(id, data, userId) {
    const documento = await Documento.findByPk(id);
    if (!documento) throw new Error('Documento no encontrado');

    await documento.update({
      ...data,
      id_usuario_modificacion: userId,
      fecha_modificacion: new Date()
    });

    return this.getDocumentoById(id);
  }

  async softDeleteDocumento(id, userId) {
    const documento = await Documento.findByPk(id);
    if (!documento) throw new Error('Documento no encontrado');

    await documento.update({
      eliminado: true,
      fecha_eliminacion: new Date(),
      id_usuario_eliminacion: userId
    });

    return true;
  }

  async restoreDocumento(id) {
    const documento = await Documento.findByPk(id, {
      include: [{ model: Archivador, attributes: ['eliminado'] }]
    });

    if (!documento) throw new Error('Documento no encontrado');

    if (documento.Archivador && documento.Archivador.eliminado) {
      throw new Error('No se puede restaurar el documento porque su Archivador contenedor ha sido eliminado. Restaure el archivador primero.');
    }

    await documento.update({
      eliminado: false,
      fecha_eliminacion: null,
      id_usuario_eliminacion: null
    });

    return true;
  }

  async hardDeleteDocumento(id) {
    const documento = await Documento.findByPk(id);
    if (!documento) throw new Error('Documento no encontrado');

    // Verificar si hay otros documentos usando el mismo archivo físico (Deduplicación)
    if (documento.ruta_archivo_digital) {
      const otherDocs = await Documento.count({
        where: {
          ruta_archivo_digital: documento.ruta_archivo_digital,
          id_documento: { [Op.ne]: id }
        }
      });

      // Si nadie más usa el archivo, lo borramos del disco
      if (otherDocs === 0) {
        const fullPath = path.join(__dirname, '../../uploads', documento.ruta_archivo_digital);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    await documento.destroy();
    return true;
  }

  async getFilePath(id) {
    const documento = await Documento.findByPk(id);
    if (!documento || !documento.ruta_archivo_digital) {
      throw new Error('Archivo no encontrado');
    }
    return path.join(__dirname, '../../uploads', documento.ruta_archivo_digital);
  }
}

module.exports = new DocumentoService();
