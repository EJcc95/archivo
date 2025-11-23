const { Documento, Archivador, Area, TipoDocumento, Usuario, ConfiguracionSistema } = require('../models');
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

      // Validar que el archivador no esté cerrado
      if (archivador.estado === 'Cerrado') {
        throw new Error('El archivador seleccionado está CERRADO y no admite más documentos.');
      }

      // Validar capacidad del archivador
      const configCapacidad = await ConfiguracionSistema.findOne({ where: { clave: 'capacidad_maxima_archivador' } });
      const capacidadMaxima = configCapacidad ? parseInt(configCapacidad.valor) : 500;

      if ((archivador.total_folios + Number(data.numero_folios)) > capacidadMaxima) {
        throw new Error(`El archivador excedería su capacidad máxima de ${capacidadMaxima} folios. Actual: ${archivador.total_folios}, Nuevo: ${data.numero_folios}`);
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

      await transaction.commit();

      // Verificar si el archivador debe cerrarse automáticamente
      if (data.id_archivador) {
        try {
          const archivador = await Archivador.findByPk(data.id_archivador);
          const configCapacidad = await ConfiguracionSistema.findOne({ where: { clave: 'capacidad_maxima_archivador' } });
          const capacidadMaxima = configCapacidad ? parseInt(configCapacidad.valor) : 500;

          if (archivador.total_folios >= capacidadMaxima && archivador.estado !== 'Cerrado') {
            await archivador.update({ estado: 'Cerrado' });
            console.log(`Archivador ${archivador.id_archivador} cerrado automáticamente por límite de capacidad.`);
          }
        } catch (err) {
          console.error('Error al verificar cierre automático de archivador:', err);
        }
      }

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

      // Validar que el archivador no esté cerrado
      if (archivador.estado === 'Cerrado') {
        throw new Error('El archivador destino está CERRADO y no admite más documentos.');
      }

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

      // Validar capacidad (considerando si ya estaba en este archivador o es nuevo)
      const configCapacidad = await ConfiguracionSistema.findOne({ where: { clave: 'capacidad_maxima_archivador' } });
      const capacidadMaxima = configCapacidad ? parseInt(configCapacidad.valor) : 500;

      let foliosAIncrementar = 0;
      const newFolios = data.numero_folios ? Number(data.numero_folios) : documento.numero_folios;

      if (Number(data.id_archivador) !== documento.id_archivador) {
        // Cambio de archivador: se suman todos los folios al nuevo
        foliosAIncrementar = newFolios;
      } else {
        // Mismo archivador: solo se suma la diferencia si aumentan
        foliosAIncrementar = newFolios - documento.numero_folios;
      }

      if (foliosAIncrementar > 0 && (archivador.total_folios + foliosAIncrementar) > capacidadMaxima) {
        throw new Error(`El archivador excedería su capacidad máxima de ${capacidadMaxima} folios.`);
      }
    } else if (!data.id_archivador && documento.id_archivador && data.numero_folios) {
      // Caso especial: Mismo archivador (no viene en data, se mantiene el del doc), pero cambian folios
      // Necesitamos validar si el aumento de folios cabe en el archivador actual
      const archivador = await Archivador.findByPk(documento.id_archivador);
      if (archivador) {
        // Validar si está cerrado (solo si aumentan folios)
        const newFolios = Number(data.numero_folios);
        const diff = newFolios - documento.numero_folios;

        if (diff > 0 && archivador.estado === 'Cerrado') {
          throw new Error('El archivador está CERRADO y no admite aumento de folios.');
        }

        const configCapacidad = await ConfiguracionSistema.findOne({ where: { clave: 'capacidad_maxima_archivador' } });
        const capacidadMaxima = configCapacidad ? parseInt(configCapacidad.valor) : 500;

        if (diff > 0 && (archivador.total_folios + diff) > capacidadMaxima) {
          throw new Error(`El archivador excedería su capacidad máxima de ${capacidadMaxima} folios.`);
        }
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
      // Nota: La actualización de folios del archivador se maneja vía Trigger en BD
      // Solo actualizamos el documento

      await documento.update({
        ...data,
        ruta_archivo_digital: rutaArchivo,
        id_usuario_modificacion: userId,
        fecha_modificacion: new Date()
      }, { transaction });

      await transaction.commit();

      // Verificar cierre automático del archivador (si hubo cambio de archivador o aumento de folios)
      const targetArchivadorId = data.id_archivador || documento.id_archivador;
      if (targetArchivadorId) {
        try {
          const archivador = await Archivador.findByPk(targetArchivadorId);
          const configCapacidad = await ConfiguracionSistema.findOne({ where: { clave: 'capacidad_maxima_archivador' } });
          const capacidadMaxima = configCapacidad ? parseInt(configCapacidad.valor) : 500;

          if (archivador.total_folios >= capacidadMaxima && archivador.estado !== 'Cerrado') {
            await archivador.update({ estado: 'Cerrado' });
            console.log(`Archivador ${archivador.id_archivador} cerrado automáticamente por límite de capacidad.`);
          }
        } catch (err) {
          console.error('Error al verificar cierre automático de archivador:', err);
        }
      }

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

      // Nota: Trigger maneja la resta de folios

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

      // Nota: Trigger maneja la suma de folios

      await transaction.commit();

      // Verificar cierre automático del archivador tras restaurar
      if (documento.id_archivador) {
        try {
          const archivador = await Archivador.findByPk(documento.id_archivador);
          const configCapacidad = await ConfiguracionSistema.findOne({ where: { clave: 'capacidad_maxima_archivador' } });
          const capacidadMaxima = configCapacidad ? parseInt(configCapacidad.valor) : 500;

          if (archivador.total_folios >= capacidadMaxima && archivador.estado !== 'Cerrado') {
            await archivador.update({ estado: 'Cerrado' });
            console.log(`Archivador ${archivador.id_archivador} cerrado automáticamente tras restauración de documento.`);
          }
        } catch (err) {
          console.error('Error al verificar cierre automático de archivador en restauración:', err);
        }
      }

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
