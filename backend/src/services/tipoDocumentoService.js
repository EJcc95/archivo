const { TipoDocumento, Documento, Archivador } = require('../models');

class TipoDocumentoService {
  async getAllTipos() {
    return await TipoDocumento.findAll({
      order: [['nombre_tipo', 'ASC']]
    });
  }

  async getById(id) {
    const tipo = await TipoDocumento.findByPk(id);
    if (!tipo) {
      throw new Error('Tipo de documento no encontrado');
    }
    return tipo;
  }

  async create(data) {
    // Check if name already exists
    const existing = await TipoDocumento.findOne({ where: { nombre_tipo: data.nombre_tipo } });
    if (existing) {
      throw new Error('Ya existe un tipo de documento con este nombre');
    }
    return await TipoDocumento.create(data);
  }

  async update(id, data) {
    const tipo = await this.getById(id);

    if (data.nombre_tipo && data.nombre_tipo !== tipo.nombre_tipo) {
      const existing = await TipoDocumento.findOne({ where: { nombre_tipo: data.nombre_tipo } });
      if (existing) {
        throw new Error('Ya existe un tipo de documento con este nombre');
      }
    }

    return await tipo.update(data);
  }

  async delete(id) {
    const tipo = await this.getById(id);

    // Check dependencies
    const documentosCount = await Documento.count({ where: { id_tipo_documento: id } });
    if (documentosCount > 0) {
      throw new Error(`No se puede eliminar: Hay ${documentosCount} documentos usando este tipo.`);
    }

    const archivadoresCount = await Archivador.count({ where: { id_tipo_documento_contenido: id } });
    if (archivadoresCount > 0) {
      throw new Error(`No se puede eliminar: Hay ${archivadoresCount} archivadores configurados para este tipo.`);
    }

    return await tipo.destroy();
  }
}

module.exports = new TipoDocumentoService();
