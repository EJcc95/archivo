require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Conectar a la base de datos
  await connectDB();

  // Iniciar servidor
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
    logger.info(`URL Base: http://localhost:${PORT}`);
  });
};

startServer();
