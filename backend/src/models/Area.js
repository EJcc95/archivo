const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Area = sequelize.define('Area', {
  id_area: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_organizacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  nombre_area: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  siglas: {
    type: DataTypes.STRING(50)
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_modificacion: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'areas',
  timestamps: false // Managed manually or via triggers in DB, but here we define fields
});

module.exports = Area;
