const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permiso = sequelize.define('Permiso', {
  id_permiso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_permiso: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'permisos',
  timestamps: false
});

module.exports = Permiso;
