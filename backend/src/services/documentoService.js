const { Documento, Archivador, Area, TipoDocumento, Usuario } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
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

    // Validaciones de negocio para Archivador
    if (data.id_archivador) {
      const archivador = await Archivador.findByPk(data.id_archivador);
      if (!archivador) {
        throw new Error('El archivador seleccionado no existe');
      }

      // Validar que el archivador pertenezca al área de origen
      if (Number(archivador.id_area_propietaria) !== Number(data.id_area_origen)) {
        throw new Error('El archivador no pertenece al área de origen seleccionada');
      }

      // Validar que el archivador sea del mismo tipo de documento
      if (Number(archivador.id_tipo_documento_contenido) !== Number(data.id_tipo_documento)) {
        throw new Error('El archivador no corresponde al tipo de documento seleccionado');
      }
    }

    if (file) {
      console.log('Processing file...');
      const processed = await this._processFile(file);
      rutaArchivo = processed.relativePath;
    }

    const transaction = await sequelize.transaction();

    try {
      const documento = await Documento.create({
        ...data,
        ruta_archivo_digital: rutaArchivo,
        id_usuario_registro: userId,
        fecha_registro_sistema: new Date(),
        eliminado: false,
        numero_consultas: 0
      }, { transaction });

      // Actualizar contador de folios del archivador
      if (data.id_archivador) {
        await Archivador.increment('total_folios', {
          by: data.numero_folios,
          where: { id_archivador: data.id_archivador },
          transaction
        });
      }

      await transaction.commit();
      return documento;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllDocumentos(query = {}) {
    const { page, limit, search = '', id_archivador, eliminado } = query;

    const whereClause = {};

    // Filtro de eliminado (Soft Delete)
    // Si eliminado es 'true', mostramos papelera. Si no, mostramos activos.
    if (eliminado !== undefined) {
      whereClause.eliminado = eliminado === 'true';
    }

    if (search) {
      whereClause[Op.or] = [
        { nombre_documento: { [Op.like]: `%${search}%` } },
        { asunto: { [Op.like]: `%${search}%` } }
      ];
    }

    if (id_archivador) whereClause.id_archivador = id_archivador;

    // If pagination params are provided, use pagination
    if (page && limit) {
      const offset = (page - 1) * limit;
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

    // Otherwise, return all documentos
    const documentos = await Documento.findAll({
      where: whereClause,
      include: [
        { model: TipoDocumento, attributes: ['nombre_tipo'] },
        { model: Area, as: 'areaOrigen', attributes: ['nombre_area'] },
        { model: Archivador, attributes: ['nombre_archivador'] }
      ],
      order: [['fecha_registro_sistema', 'DESC']]
    });

    return documentos;
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

  async updateDocumento(id, data, userId, file) {
    const documento = await Documento.findByPk(id);
    if (!documento) throw new Error('Documento no encontrado');

    // Validaciones si cambia el archivador
    if (data.id_archivador && Number(data.id_archivador) !== documento.id_archivador) {
      const archivador = await Archivador.findByPk(data.id_archivador);
      if (!archivador) throw new Error('El archivador seleccionado no existe');

      // Validar área (usar data.id_area_origen si viene, sino la del documento actual)
      const idAreaOrigen = data.id_area_origen ? Number(data.id_area_origen) : documento.id_area_origen;
      if (Number(archivador.id_area_propietaria) !== idAreaOrigen) {
        throw new Error('El archivador no pertenece al área de origen del documento');
      }

      // Validar tipo documento
      const idTipoDoc = data.id_tipo_documento ? Number(data.id_tipo_documento) : documento.id_tipo_documento;
      if (Number(archivador.id_tipo_documento_contenido) !== idTipoDoc) {
        throw new Error('El archivador no corresponde al tipo de documento');
      }
    }

    let rutaArchivo = documento.ruta_archivo_digital;

    // Si se proporciona un nuevo archivo, procesarlo
    if (file) {
      const processed = await this._processFile(file);
      rutaArchivo = processed.relativePath;
    }

    const transaction = await sequelize.transaction();

    try {
      // Lógica de actualización de folios
      const oldArchivadorId = documento.id_archivador;
      const newArchivadorId = data.id_archivador ? Number(data.id_archivador) : oldArchivadorId;
      const oldFolios = documento.numero_folios;
      const newFolios = data.numero_folios ? Number(data.numero_folios) : oldFolios;

      // Caso 1: Cambio de archivador
      if (oldArchivadorId !== newArchivadorId) {
        // Restar del viejo
        if (oldArchivadorId) {
          await Archivador.decrement('total_folios', {
            by: oldFolios,
            where: { id_archivador: oldArchivadorId },
            transaction
          });
        }
        // Sumar al nuevo
        if (newArchivadorId) {
          await Archivador.increment('total_folios', {
            by: newFolios,
            where: { id_archivador: newArchivadorId },
            transaction
          });
        }
      }
      // Caso 2: Mismo archivador, cambio de folios
      else if (newArchivadorId && oldFolios !== newFolios) {
        const diff = newFolios - oldFolios;
        if (diff !== 0) {
          await Archivador.increment('total_folios', {
            by: diff,
            where: { id_archivador: newArchivadorId },
            transaction
          });
        }
      }

      await documento.update({
        ...data,
        ruta_archivo_digital: rutaArchivo,
        id_usuario_modificacion: userId,
        fecha_modificacion: new Date()
      }, { transaction });

      await transaction.commit();
      return this.getDocumentoById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async softDeleteDocumento(id, userId) {
    const documento = await Documento.findByPk(id);
    if (!documento) throw new Error('Documento no encontrado');

    const transaction = await sequelize.transaction();

    try {
      await documento.update({
        eliminado: true,
        fecha_eliminacion: new Date(),
        id_usuario_eliminacion: userId
      }, { transaction });

      // Restar folios del archivador al enviar a papelera
      if (documento.id_archivador) {
        await Archivador.decrement('total_folios', {
          by: documento.numero_folios,
          where: { id_archivador: documento.id_archivador },
          transaction
        });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async restoreDocumento(id) {
    const documento = await Documento.findByPk(id, {
      include: [{ model: Archivador, attributes: ['eliminado'] }]
    });

    if (!documento) throw new Error('Documento no encontrado');

    if (documento.Archivador && documento.Archivador.eliminado) {
      throw new Error('No se puede restaurar el documento porque su Archivador contenedor ha sido eliminado. Restaure el archivador primero.');
    }

    const transaction = await sequelize.transaction();

    try {
      await documento.update({
        eliminado: false,
        fecha_eliminacion: null,
        id_usuario_eliminacion: null
      }, { transaction });

      // Sumar folios al archivador al restaurar
      if (documento.id_archivador) {
        await Archivador.increment('total_folios', {
          by: documento.numero_folios,
          where: { id_archivador: documento.id_archivador },
          transaction
        });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

    // Nota: No es necesario restar folios aquí porque hardDelete solo se llama después de softDelete (donde ya se restaron),
    // O si se implementa directo, habría que restar. Asumimos flujo normal soft -> hard.
    // Si el documento NO estaba eliminado (caso raro de hard delete directo), habría que restar.
    // Por seguridad, verificamos:
    if (!documento.eliminado && documento.id_archivador) {
      await Archivador.decrement('total_folios', {
        by: documento.numero_folios,
        where: { id_archivador: documento.id_archivador }
      });
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
