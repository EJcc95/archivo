const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Organizacion = sequelize.define('Organizacion', {
  id_organizacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ruc: {
    type: DataTypes.STRING(11),
    unique: true
  },
  direccion: {
    type: DataTypes.STRING(255)
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'organizacion',
  timestamps: false
});

module.exports = Organizacion;
