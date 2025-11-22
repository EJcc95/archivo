const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
  id_auditoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tabla_afectada: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  id_registro_afectado: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_hora: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  detalles: {
    type: DataTypes.TEXT
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.TEXT
  },
  accion_detalle: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'auditoria',
  timestamps: false
});

module.exports = Auditoria;
