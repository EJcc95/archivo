const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PrestamoArchivador = sequelize.define('PrestamoArchivador', {
  id_prestamo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_archivador: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario_solicitante: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_prestamo: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_devolucion_esperada: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_devolucion_real: {
    type: DataTypes.DATE
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Devuelto', 'Vencido'),
    allowNull: false,
    defaultValue: 'Activo'
  }
}, {
  tableName: 'prestamos_archivadores',
  timestamps: false
});

module.exports = PrestamoArchivador;
