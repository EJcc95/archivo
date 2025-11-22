const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConfiguracionSistema = sequelize.define('ConfiguracionSistema', {
  id_config: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  fecha_modificacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'configuracion_sistema',
  timestamps: false
});

module.exports = ConfiguracionSistema;
