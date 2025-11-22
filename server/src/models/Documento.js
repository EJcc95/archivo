const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Documento = sequelize.define('Documento', {
  id_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_documento: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  asunto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha_documento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  numero_folios: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  ruta_archivo_digital: {
    type: DataTypes.STRING(255)
  },
  id_tipo_documento: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_area_origen: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_area_destino: {
    type: DataTypes.INTEGER
  },
  destinatario_externo: {
    type: DataTypes.STRING(200)
  },
  id_archivador: {
    type: DataTypes.INTEGER
  },
  id_archivador_original: {
    type: DataTypes.INTEGER
  },
  id_usuario_registro: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_registro_sistema: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_usuario_modificacion: {
    type: DataTypes.INTEGER
  },
  fecha_modificacion: {
    type: DataTypes.DATE
  },
  eliminado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fecha_eliminacion: {
    type: DataTypes.DATE
  },
  id_usuario_eliminacion: {
    type: DataTypes.INTEGER
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  fecha_ultima_consulta: {
    type: DataTypes.DATE
  },
  numero_consultas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'documentos',
  timestamps: false
});

module.exports = Documento;
