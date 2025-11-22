const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de logs exista
const logDir = 'log';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formato de fecha y hora para Perú
const timezoned = () => {
  return new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Formato personalizado del log
const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: timezoned }),
    customFormat
  ),
  transports: [
    // Log de errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // Log combinado (éxito e info)
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    }),
    // Log en consola para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: timezoned }),
        customFormat
      )
    })
  ]
});

module.exports = logger;
