const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolPermiso = sequelize.define('RolPermiso', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  id_permiso: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'roles_permisos',
  timestamps: false
});

module.exports = RolPermiso;
