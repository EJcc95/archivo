const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TipoDocumento = sequelize.define('TipoDocumento', {
  id_tipo_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_tipo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'tipos_documento',
  timestamps: false
});

module.exports = TipoDocumento;
