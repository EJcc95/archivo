const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PasswordResetAttempt = sequelize.define('PasswordResetAttempt', {
  id_intento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  fecha_intento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  exito: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  motivo_fallo: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'password_reset_attempts',
  timestamps: false
});

module.exports = PasswordResetAttempt;
