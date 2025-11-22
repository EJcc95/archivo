const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Archivador = sequelize.define('Archivador', {
  id_archivador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_archivador: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_area_propietaria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_tipo_documento_contenido: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_folios: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ubicacion_fisica: {
    type: DataTypes.STRING(255)
  },
  fecha_creacion: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  id_usuario_creacion: {
    type: DataTypes.INTEGER
  },
  fecha_modificacion: {
    type: DataTypes.DATE
  },
  id_usuario_modificacion: {
    type: DataTypes.INTEGER
  },
  estado: {
    type: DataTypes.ENUM('Abierto', 'Cerrado', 'En Custodia'),
    allowNull: false,
    defaultValue: 'Abierto'
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
  }
}, {
  tableName: 'archivadores',
  timestamps: false
});

module.exports = Archivador;
