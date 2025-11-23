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
    unique: true,
    validate: {
      notEmpty: {
        msg: 'La clave no puede estar vacía'
      },
      is: {
        args: /^[A-Z0-9_]+$/,
        msg: 'La clave debe contener solo mayúsculas, números y guiones bajos'
      }
    }
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El valor no puede estar vacío'
      }
    }
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
  timestamps: false,
  hooks: {
    beforeUpdate: (config) => {
      config.fecha_modificacion = new Date();
    }
  }
});

module.exports = ConfiguracionSistema;
