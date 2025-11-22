const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Directorios base
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');
const STORAGE_DIR = path.join(UPLOADS_DIR, 'storage');

// Asegurar que existan los directorios
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

// Configuración de almacenamiento temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    // Usamos UUID temporalmente para evitar colisiones en temp
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  console.log('Multer File Filter:', file.mimetype, file.originalname);
  // Lista blanca de tipos MIME permitidos
  const allowedTypes = [
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('File rejected:', file.mimetype);
    cb(new Error('Tipo de archivo no permitido. Solo se permiten archivos PDF.'), false);
  }
};

// Límites
const limits = {
  fileSize: 400 * 1024 * 1024 // 400 MB
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = {
  upload,
  TEMP_DIR,
  STORAGE_DIR
};
