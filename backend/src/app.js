const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const logger = require('./config/logger');

const app = express();

// Seguridad HTTP headers con configuración para permitir iframes desde frontend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "frame-ancestors": [
        "'self'",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://archivo.muninuevoimperial.gob.pe",
      ],
    },
  },
}));

// Configuración de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://archivo.muninuevoimperial.gob.pe',
  'https://api.muninuevoimperial.gob.pe'
];

// Agregar orígenes desde variable de entorno si existen
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',');
  envOrigins.forEach(origin => {
    const trimmedOrigin = origin.trim();
    if (trimmedOrigin && !allowedOrigins.includes(trimmedOrigin)) {
      allowedOrigins.push(trimmedOrigin);
    }
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Origen bloqueado por CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de URL-encoded

const routes = require('./routes');

// Ruta base de prueba
app.get('/info', (req, res) => {
  res.json({
    message: 'Bienvenido a la API del Archivo Electrónico Municipal - AEM',
    version: '1.0.0',
    timestamp: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
  });
});

// API Routes
app.use('/api', routes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Manejador de errores global
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;
