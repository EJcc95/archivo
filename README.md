# Archivo Electrónico Municipal - AEM

Plataforma integral de gestión y administración de documentos electrónicos para municipalidades.

## 📋 Tabla de Contenidos

- [¿Qué es AEM?](#qué-es-aem)
- [Características](#características)
- [Para Qué Sirve](#para-qué-sirve)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Recomendaciones](#recomendaciones)

---

## ¿Qué es AEM?

**Archivo Electrónico Municipal (AEM)** es una solución web moderna diseñada para facilitar la gestión, organización y administración de documentos electrónicos en instituciones municipales. Proporciona un sistema centralizado, seguro y eficiente para el control de documentos, con capacidades de:

- Clasificación y organización de documentos
- Control de permisos y roles de usuario
- Seguimiento de préstamos de documentos
- Auditoría de acciones y cambios
- Generación de reportes detallados
- Gestión de áreas y archivadores

El sistema está diseñado para modernizar los procesos administrativos municipales, eliminando la dependencia de documentos físicos y proporcionando acceso rápido y controlado a la información.

---

## ✨ Características

### Gestión de Documentos
- ✅ **Creación y edición** de documentos electrónicos
- ✅ **Clasificación automática** por tipo, área y archivador
- ✅ **Prenombre auto-generado** (formato: Tipo nnnn-YYYY-Siglas)
- ✅ **Carga de archivos digitales** con validación de tipos
- ✅ **Búsqueda avanzada** con múltiples filtros
- ✅ **Vista en papelera** para documentos eliminados
- ✅ **Recuperación de documentos huérfanos**

### Control de Sesiones
- ✅ **Timeout automático** después de 5 minutos de inactividad
- ✅ **Advertencia modal** 1 minuto antes del cierre de sesión
- ✅ **Sincronización entre múltiples pestañas/ventanas**
- ✅ **Logout global** - cierra todas las sesiones abiertas simultáneamente
- ✅ **Detección de actividad** en tiempo real

### Gestión de Usuarios
- ✅ **Crear, editar y eliminar usuarios** (soft delete)
- ✅ **Asignación de roles y permisos**
- ✅ **Asignación de áreas de trabajo**
- ✅ **Estado activo/inactivo de usuarios**
- ✅ **Envío de credenciales por email** (bienvenida y reseteo)
- ✅ **Recuperación de contraseña** con token temporal

### Control de Acceso
- ✅ **Sistema de roles** personalizable (Admin, Encargado, Usuario)
- ✅ **Permisos granulares** por módulo y acción
- ✅ **Middleware de autenticación** con JWT
- ✅ **Middleware de autorización** basado en permisos
- ✅ **Protección CSRF** y validación de seguridad

### Auditoría y Reportes
- ✅ **Log completo de auditoría** de acciones del usuario
- ✅ **Tracking de cambios** en documentos
- ✅ **Reportes detallados** con filtros avanzados
- ✅ **Exportación de reportes** en múltiples formatos
- ✅ **Análisis de actividad** por período

### Gestión de Préstamos
- ✅ **Solicitar préstamo** de archivadores
- ✅ **Aprobar/rechazar** solicitudes
- ✅ **Devolución automática** con validación
- ✅ **Historial de préstamos** por usuario
- ✅ **Notificaciones** de préstamo pendiente

### Configuración del Sistema
- ✅ **Gestión de áreas organizacionales**
- ✅ **Configuración de archivadores** y capacidad
- ✅ **Definición de tipos de documentos**
- ✅ **Parámetros del sistema** editables
- ✅ **Backup y recuperación** de datos

---

## 🎯 Para Qué Sirve

### Problemas que Resuelve

1. **Desorden Documental**
   - Centraliza todos los documentos en una plataforma única
   - Organiza automáticamente por área, tipo y archivador

2. **Pérdida de Documentos**
   - Backup automático en base de datos
   - Historial completo y recuperación de versiones

3. **Inseguridad en Acceso**
   - Control de permisos granular
   - Auditoría de quién accede y cuándo

4. **Falta de Trazabilidad**
   - Registro completo de cambios
   - Historial de préstamos y devoluciones

5. **Procesos Manuales Ineficientes**
   - Automatización de flujos documentales
   - Generación automática de nombres y referencias

### Beneficios

- 📊 **Eficiencia**: Reduce tiempo de búsqueda y localización
- 🔒 **Seguridad**: Control total sobre acceso y permisos
- 📈 **Escalabilidad**: Maneja miles de documentos sin problemas
- 🌐 **Accesibilidad**: Acceso desde cualquier dispositivo y navegador
- 💾 **Confiabilidad**: Respaldo automático y recuperación de datos
- 📋 **Cumplimiento**: Auditoría para requisitos regulatorios

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18+ | Framework UI |
| **TypeScript** | 5+ | Tipado estático |
| **Vite** | 5+ | Build tool y dev server |
| **Tailwind CSS** | 3+ | Estilos y diseño responsive |
| **React Router** | 6+ | Navegación y rutas |
| **React Query** | 5+ | State management y sincronización |
| **Axios** | 1+ | Cliente HTTP |
| **React Hot Toast** | - | Notificaciones |
| **Tabler Icons** | - | Iconografía |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 16+ | Runtime JavaScript |
| **Express.js** | 4+ | Framework web |
| **Sequelize** | 6+ | ORM para base de datos |
| **MySQL** | 8+ | Base de datos relacional |
| **JWT** | - | Autenticación |
| **bcrypt** | - | Hashing de contraseñas |
| **Nodemailer** | - | Envío de emails |
| **Multer** | - | Carga de archivos |
| **Helmet** | - | Seguridad HTTP |
| **CORS** | - | Control de origen |

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Git**: Control de versiones
- **.env**: Variables de entorno

---

## ⚙️ Requisitos

### Requisitos del Sistema

**Servidor Backend:**
- Node.js 16 o superior
- npm o yarn
- MySQL 8.0 o superior
- Puerto 3000 (configurable)

**Servidor Frontend:**
- Node.js 16 o superior
- npm o yarn
- Puerto 5173 (desarrollo) o 80/443 (producción)

**Cliente:**
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet

### Requisitos de Desarrollo

```bash
# Backend
node --version  # >= v16.0.0
npm --version   # >= 8.0.0

# Frontend
node --version  # >= v16.0.0
npm --version   # >= 8.0.0
```

### Variables de Entorno Requeridas

**Backend** (`.env`):
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=archivo
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3000/api
```

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/EJcc95/archivo.git
cd archivo
```

### 2. Instalación Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones (crear tablas)
npm run migrate

# Iniciar servidor
npm run dev
```

### 3. Instalación Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Acceder a la Aplicación

```
Frontend: http://localhost:5173
Backend: http://localhost:3000
```

---

## 📂 Estructura del Proyecto

```
archivo/
├── backend/                          # Servidor Express
│   ├── src/
│   │   ├── app.js                   # Configuración de Express
│   │   ├── config/                  # Configuraciones
│   │   │   ├── database.js          # Conexión a BD
│   │   │   ├── logger.js            # Sistema de logs
│   │   │   └── upload.js            # Configuración de uploads
│   │   ├── controllers/             # Lógica de controladores
│   │   │   ├── authController.js
│   │   │   ├── documentoController.js
│   │   │   ├── usuarioController.js
│   │   │   ├── prestamoController.js
│   │   │   ├── reportController.js
│   │   │   ├── auditController.js
│   │   │   └── ...
│   │   ├── models/                  # Modelos Sequelize
│   │   │   ├── Usuario.js
│   │   │   ├── Documento.js
│   │   │   ├── Rol.js
│   │   │   ├── Area.js
│   │   │   └── ...
│   │   ├── routes/                  # Rutas API
│   │   │   ├── authRoutes.js
│   │   │   ├── documentoRoutes.js
│   │   │   ├── usuarioRoutes.js
│   │   │   └── ...
│   │   ├── services/                # Lógica de negocios
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── documentoService.js
│   │   │   ├── emailService.js
│   │   │   └── ...
│   │   ├── middlewares/             # Middlewares Express
│   │   │   ├── authMiddleware.js
│   │   │   ├── permissionMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── validators/              # Validación de datos
│   │   │   ├── authValidator.js
│   │   │   ├── documentoValidator.js
│   │   │   └── ...
│   │   ├── utils/                   # Utilidades
│   │   │   ├── jwt.js
│   │   │   ├── password.js
│   │   │   └── ...
│   │   └── database/                # Scripts SQL
│   │       ├── 01_creacion_tablas.sql
│   │       ├── 02_vistas.sql
│   │       ├── 03_datos.sql
│   │       ├── 04_procedures.sql
│   │       └── 05_triggers.sql
│   ├── server.js                    # Punto de entrada
│   ├── package.json
│   └── .env
│
├── frontend/                         # Aplicación React
│   ├── src/
│   │   ├── App.tsx                  # Componente raíz
│   │   ├── main.tsx                 # Punto de entrada
│   │   ├── auth/                    # Autenticación
│   │   │   └── AuthProvider.tsx
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── ui/                  # Componentes UI
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── SearchableSelect.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── ConfirmModal.tsx
│   │   │   │   ├── InactivityWarningModal.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── header/
│   │   ├── pages/                   # Páginas de la aplicación
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── documentos/
│   │   │   │   ├── DocumentosPage.tsx
│   │   │   │   ├── DocumentoNuevoPage.tsx
│   │   │   │   ├── DocumentoEditarPage.tsx
│   │   │   │   ├── DocumentoDetallePage.tsx
│   │   │   │   └── ...
│   │   │   ├── usuarios/
│   │   │   ├── roles/
│   │   │   ├── prestamos/
│   │   │   ├── reportes/
│   │   │   ├── auditoria/
│   │   │   └── ...
│   │   ├── services/                # Servicios API
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── documentoService.ts
│   │   │   ├── prestamoService.ts
│   │   │   └── ...
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useToast.ts
│   │   │   ├── useInactivityLogout.ts
│   │   │   └── ...
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   └── SidebarContext.tsx
│   │   ├── routes/                  # Rutas de React Router
│   │   │   ├── AppRouter.tsx
│   │   │   └── ProtectedRoutes.tsx
│   │   ├── types/                   # Tipos TypeScript
│   │   │   ├── auth.ts
│   │   │   ├── models.ts
│   │   │   └── ...
│   │   ├── utils/                   # Utilidades
│   │   │   ├── encryption.ts
│   │   │   └── ...
│   │   ├── config/                  # Configuraciones
│   │   │   └── layoutConfig.ts
│   │   ├── api/                     # Configuración de API
│   │   │   └── axios.ts
│   │   └── assets/                  # Recursos estáticos
│   ├── public/                      # Archivos públicos
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env
│
├── README.md
└── LICENSE
```

---

## 🧩 Módulos Principales

### 1. **Módulo de Autenticación**
- Login con email/usuario y contraseña
- Recuperación de contraseña por email
- JWT con refresh token
- Cierre de sesión seguro
- Control de sesiones múltiples

**Archivos principales:**
```
Backend: authController.js, authService.js, authMiddleware.js
Frontend: AuthProvider.tsx, LoginPage.tsx, ForgotPasswordPage.tsx
```

### 2. **Módulo de Documentos**
- CRUD completo de documentos
- Clasificación automática
- Carga de archivos digitales
- Búsqueda y filtrado avanzado
- Vista de papelera
- Recuperación de huérfanos

**Archivos principales:**
```
Backend: documentoController.js, documentoService.js, Documento.js
Frontend: DocumentosPage.tsx, DocumentoNuevoPage.tsx, DocumentoDetallePage.tsx
```

### 3. **Módulo de Usuarios**
- Crear, editar y eliminar usuarios
- Asignación de roles y áreas
- Reseteo de contraseña por admin
- Envío de credenciales por email
- Control de estado (activo/inactivo)

**Archivos principales:**
```
Backend: userController.js, userService.js, Usuario.js
Frontend: UsuariosPage.tsx, UsuarioNuevoPage.tsx, UsuarioEditarPage.tsx
```

### 4. **Módulo de Roles y Permisos**
- Definición de roles personalizados
- Asignación granular de permisos
- Control de acceso basado en roles (RBAC)
- Validación en backend y frontend

**Archivos principales:**
```
Backend: rolController.js, roleService.js, Rol.js, RolPermiso.js
Frontend: RolesPage.tsx, RolNuevoPage.tsx, RolPermisosPage.tsx
```

### 5. **Módulo de Prestamos**
- Solicitar préstamo de archivadores
- Aprobar/rechazar solicitudes
- Devolución con validación
- Historial de préstamos
- Notificaciones

**Archivos principales:**
```
Backend: prestamoController.js, prestamoService.js, PrestamoArchivador.js
Frontend: PrestamosPage.tsx, PrestamoNuevoPage.tsx
```

### 6. **Módulo de Auditoría**
- Registro de todas las acciones
- Seguimiento de cambios en documentos
- Historial de usuario
- Filtros avanzados

**Archivos principales:**
```
Backend: auditController.js, auditService.js, Auditoria.js
Frontend: AuditoriaPage.tsx
```

### 7. **Módulo de Reportes**
- Reportes por período
- Filtros múltiples (usuario, área, tipo)
- Exportación a formatos
- Gráficas y análisis

**Archivos principales:**
```
Backend: reportController.js, reportService.js
Frontend: ReportesPage.tsx
```

### 8. **Módulo de Configuración**
- Gestión de áreas
- Configuración de archivadores
- Tipos de documentos
- Parámetros del sistema

**Archivos principales:**
```
Backend: configController.js, areaController.js, archivadorController.js
Frontend: ConfiguracionPage.tsx, AreasPage.tsx, ArchivadoresPage.tsx
```

---

## 📌 Recomendaciones

### Seguridad

1. **Variables de Entorno**
   - Nunca commits `.env` files
   - Usa valores seguros para JWT_SECRET en producción
   - Cambia las credenciales SMTP por las tuyas

2. **Base de Datos**
   - Usa contraseña fuerte para MySQL
   - Configura backups automáticos diarios
   - Implementa rotación de logs

3. **Autenticación**
   - Implementa 2FA para cuentas admin
   - Configura políticas de contraseña fuerte
   - Usa HTTPS en producción

4. **API**
   - Valida todas las entradas en backend
   - Implementa rate limiting en producción
   - Usa CORS restrictivo en producción

### Performance

1. **Frontend**
   - Utiliza lazy loading para componentes pesados
   - Optimiza imágenes y assets
   - Implementa caching con React Query
   - Monitorea bundle size

2. **Backend**
   - Indexa columnas usadas en búsquedas (email, nombre_usuario)
   - Implementa paginación en listados
   - Usa connection pooling en MySQL
   - Monitorea queries lentas

3. **Base de Datos**
   ```sql
   -- Índices recomendados
   CREATE INDEX idx_usuario_email ON Usuario(email);
   CREATE INDEX idx_usuario_nombre_usuario ON Usuario(nombre_usuario);
   CREATE INDEX idx_documento_nombre ON Documento(nombre_documento);
   CREATE INDEX idx_documento_fecha ON Documento(fecha_creacion);
   CREATE INDEX idx_auditoria_usuario ON Auditoria(id_usuario);
   CREATE INDEX idx_auditoria_fecha ON Auditoria(fecha_accion);
   ```

### Desarrollo

1. **Código**
   - Sigue convenciones de nombre consistentes
   - Comenta código complejo
   - Usa TypeScript en todo el frontend
   - Implementa type safety en backend con Sequelize

2. **Testing**
   - Escribe tests para funciones críticas
   - Prueba flujos de autenticación
   - Valida permisos en endpoints

3. **Documentación**
   - Mantén API documentada (Postman/Swagger)
   - Documenta procesos de deployment
   - Crea guides para nuevos desarrolladores

### Deployment

1. **Preparación**
   - Ejecuta `npm run build` en frontend
   - Configura variables de entorno en servidor
   - Crea backup de base de datos antes de deploy

2. **Producción**
   - Usa process manager (PM2) para Node.js
   - Configura Nginx/Apache como reverse proxy
   - Habilita gzip compression
   - Configura SSL/TLS (Let's Encrypt)
   - Implementa CDN para assets estáticos

3. **Monitoreo**
   - Configura logs centralizados
   - Implementa alertas para errores críticos
   - Monitorea uso de CPU y memoria
   - Realiza backups automáticos regularmente

### Mantenimiento

1. **Actualizaciones**
   - Actualiza dependencias regularmente
   - Revisa security advisories
   - Prueba en staging antes de producción

2. **Limpieza**
   - Limpia archivos huérfanos periódicamente
   - Arquiva documentos antiguos
   - Revisa logs de auditoría

3. **Escalabilidad**
   - Considera microservicios si crece mucho
   - Implementa caché (Redis) si necesario
   - Usa load balancing en producción

---

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo LICENSE para más detalles.
