const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EstadoDocumento = sequelize.define('EstadoDocumento', {
  id_estado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'estados_documento',
  timestamps: false
});

module.exports = EstadoDocumento;
