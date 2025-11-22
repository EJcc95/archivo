const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_organizacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  nombre_usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombres: {
    type: DataTypes.STRING(75),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_area: {
    type: DataTypes.INTEGER
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

module.exports = Usuario;
