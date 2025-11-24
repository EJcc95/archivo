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

### 1. **Módulo de Autenticación** 🔐

**Descripción:** Sistema de autenticación seguro con JWT, refresh tokens y recuperación de contraseña.

**Funcionalidades:**
- ✅ Login con email o nombre de usuario
- ✅ Generación de JWT (access token)
- ✅ Refresh token con rotación automática
- ✅ Recuperación de contraseña por email
- ✅ Reset de contraseña con token temporal
- ✅ Logout seguro y revocación de tokens
- ✅ Auditoría de intentos de login
- ✅ Control de intentos fallidos

**Endpoints Backend:**
```
POST   /api/auth/login                    # Iniciar sesión
POST   /api/auth/refresh                  # Renovar access token
POST   /api/auth/logout                   # Cerrar sesión
POST   /api/auth/request-password-reset   # Solicitar reset
POST   /api/auth/reset-password           # Confirmar reset
```

**Componentes Frontend:**
- `LoginPage.tsx` - Formulario de login
- `ForgotPasswordPage.tsx` - Solicitud de recuperación
- `ResetPasswordPage.tsx` - Confirmación de reset
- `AuthProvider.tsx` - Context de autenticación
- `useAuth.ts` - Hook para acceso a datos de auth

**Archivos Principales:**
```
Backend:  authController.js, authService.js, authMiddleware.js, 
          PasswordResetToken.js, PasswordResetAttempt.js, RefreshToken.js
Frontend: AuthProvider.tsx, LoginPage.tsx, ForgotPasswordPage.tsx, 
          ResetPasswordPage.tsx, authService.ts
```

**Permisos Requeridos:**
- `auth_login` - Iniciar/cerrar sesión
- `auth_profile` - Ver y editar perfil

---

### 2. **Módulo de Documentos** 📄

**Descripción:** Gestión completa del ciclo de vida de documentos electrónicos con clasificación automática, versionado y búsqueda avanzada.

**Funcionalidades:**
- ✅ Crear documentos con clasificación automática
- ✅ Generación automática de prenombre (Tipo nnnn-YYYY-Siglas)
- ✅ Edición y actualización de metadatos
- ✅ Carga de archivos digitales (PDF, Word, Excel, etc.)
- ✅ Descarga de archivos adjuntos
- ✅ Búsqueda por prenombre, nombre, descripción
- ✅ Filtrado por: área, tipo, estado, archivador, rango de fechas
- ✅ Eliminación lógica (soft delete)
- ✅ Vista de papelera con recuperación
- ✅ Identificación de documentos huérfanos
- ✅ Cambio de estado (Registrado → En Proceso → Archivado → Prestado)
- ✅ Historial de cambios y auditoría

**Estados de Documentos:**
1. **Registrado** - Documento acaba de ser creado
2. **En Proceso** - Está siendo archivado
3. **Archivado** - Archivado en el archivador correspondiente
4. **Prestado** - Documento en préstamo temporal

**Endpoints Backend:**
```
GET    /api/documentos                    # Listar documentos con filtros
GET    /api/documentos/:id                # Obtener detalle
POST   /api/documentos                    # Crear documento
PUT    /api/documentos/:id                # Editar documento
DELETE /api/documentos/:id                # Eliminar (soft delete)
GET    /api/documentos/papelera           # Listar eliminados
POST   /api/documentos/:id/restore        # Restaurar eliminado
POST   /api/documentos/:id/upload         # Cargar archivo
GET    /api/documentos/:id/download       # Descargar archivo
POST   /api/documentos/huerfanos          # Identificar huérfanos
```

**Componentes Frontend:**
- `DocumentosPage.tsx` - Listado principal con filtros
- `DocumentoNuevoPage.tsx` - Crear nuevo documento
- `DocumentoEditarPage.tsx` - Editar documento existente
- `DocumentoDetallePage.tsx` - Ver detalles completos
- `DataTable.tsx` - Tabla reutilizable
- `SearchableSelect.tsx` - Selector de áreas/archivadores/tipos
- `UploadProgressModal.tsx` - Progreso de carga

**Archivos Principales:**
```
Backend:  documentoController.js, documentoService.js, Documento.js,
          documentoValidator.js
Frontend: DocumentoNuevoPage.tsx, DocumentoEditarPage.tsx,
          DocumentoDetallePage.tsx, DocumentosPage.tsx,
          documentoService.ts, documentoValidator.ts
```

**Permisos Requeridos:**
- `docs_read` - Ver documentos
- `docs_create` - Crear documentos
- `docs_edit` - Editar documentos
- `docs_delete` - Eliminar documentos
- `docs_upload` - Cargar archivos

---

### 3. **Módulo de Usuarios** 👥

**Descripción:** Gestión completa de usuarios del sistema con roles, permisos y control de acceso.

**Funcionalidades:**
- ✅ Crear nuevos usuarios
- ✅ Editar información de usuario (nombre, email, área)
- ✅ Eliminar usuarios (soft delete)
- ✅ Asignación de rol
- ✅ Asignación de área de trabajo
- ✅ Activar/desactivar usuarios
- ✅ Envío automático de credenciales por email
- ✅ Reset de contraseña por administrador
- ✅ Vista de perfil personal
- ✅ Cambio de contraseña personal
- ✅ Historial de actividad del usuario
- ✅ Búsqueda y filtrado
- ✅ Validación de email único

**Endpoints Backend:**
```
GET    /api/users                         # Listar usuarios
GET    /api/users/:id                     # Obtener usuario
POST   /api/users                         # Crear usuario
PUT    /api/users/:id                     # Editar usuario
DELETE /api/users/:id                     # Eliminar usuario
POST   /api/users/:id/reset-password      # Reset password (admin)
GET    /api/users/profile                 # Mi perfil
PUT    /api/users/profile                 # Editar mi perfil
POST   /api/users/change-password         # Cambiar mi contraseña
```

**Componentes Frontend:**
- `UsuariosPage.tsx` - Listado de usuarios
- `UsuarioNuevoPage.tsx` - Crear nuevo usuario
- `UsuarioEditarPage.tsx` - Editar usuario
- `ProfilePage.tsx` - Ver/editar perfil personal
- `DataTable.tsx` - Tabla de usuarios
- `SearchableSelect.tsx` - Selector de roles/áreas

**Archivos Principales:**
```
Backend:  userController.js, userService.js, Usuario.js,
          userValidator.js
Frontend: UsuariosPage.tsx, UsuarioNuevoPage.tsx,
          UsuarioEditarPage.tsx, ProfilePage.tsx,
          userService.ts, userValidator.ts
```

**Permisos Requeridos:**
- `auth_profile` - Ver y editar perfil propio
- `users_read` - Ver usuarios
- `users_admin` - Crear, editar usuarios

---

### 4. **Módulo de Roles y Permisos** 🔑

**Descripción:** Sistema de control de acceso basado en roles (RBAC) con permisos granulares.

**Funcionalidades:**
- ✅ Crear roles personalizados
- ✅ Editar roles existentes
- ✅ Eliminar roles (si no están asignados)
- ✅ Asignación granular de permisos a roles
- ✅ Visualización de permisos por rol
- ✅ Validación de permisos en backend y frontend
- ✅ Control de acceso a rutas y endpoints
- ✅ 24 permisos predefinidos del sistema
- ✅ Herencia de permisos (Administrador > Supervisor > Registrador > Consultor)

**Roles Predefinidos:**
1. **Administrador** - Acceso total al sistema
2. **Registrador** - Crear, editar y buscar documentos
3. **Consultor** - Solo lectura de documentos
4. **Supervisor** - Gestión intermedia y supervisión

**Permisos del Sistema:**
- Autenticación: `auth_login`, `auth_profile`
- Documentos: `docs_read`, `docs_create`, `docs_edit`, `docs_delete`, `docs_upload`, `docs_stats`
- Áreas: `areas_read`, `areas_write`, `areas_admin`
- Archivadores: `arch_read`, `arch_write`, `arch_transfer`, `arch_admin`
- Tipos: `tipos_read`, `tipos_write`
- Préstamos: `prestamos_request`, `prestamos_approve`, `prestamos_admin`
- Usuarios: `users_read`, `users_admin`
- Reportes: `reports_access`
- Sistema: `system_admin`

**Endpoints Backend:**
```
GET    /api/roles                         # Listar roles
GET    /api/roles/:id                     # Obtener rol
POST   /api/roles                         # Crear rol
PUT    /api/roles/:id                     # Editar rol
DELETE /api/roles/:id                     # Eliminar rol
GET    /api/roles/:id/permisos            # Permisos del rol
POST   /api/roles/:id/permisos            # Asignar permisos
```

**Componentes Frontend:**
- `RolesPage.tsx` - Listado de roles
- `RolNuevoPage.tsx` - Crear nuevo rol
- `RolEditarPage.tsx` - Editar rol
- `RolPermisosPage.tsx` - Gestionar permisos del rol

**Archivos Principales:**
```
Backend:  rolController.js, roleService.js, Rol.js, RolPermiso.js,
          Permiso.js, roleValidator.js
Frontend: RolesPage.tsx, RolNuevoPage.tsx, RolEditarPage.tsx,
          RolPermisosPage.tsx, roleService.ts, usePermissions.ts
```

**Permisos Requeridos:**
- `users_admin` - Gestionar roles y permisos

---

### 5. **Módulo de Préstamos** 📦

**Descripción:** Sistema de control de préstamos de archivadores con aprobación y devolución.

**Funcionalidades:**
- ✅ Solicitar préstamo de archivador
- ✅ Listado de mis préstamos (usuario)
- ✅ Listado de todas las solicitudes (admin)
- ✅ Aprobar/rechazar solicitudes
- ✅ Devolución de archivador
- ✅ Validación de capacidad
- ✅ Historial de préstamos
- ✅ Notificación por email
- ✅ Auditoría de préstamos
- ✅ Estados: Pendiente → Aprobado → Devuelto/Rechazado

**Estados de Préstamo:**
1. **Pendiente** - Esperando aprobación
2. **Aprobado** - Autorizado para prestar
3. **Devuelto** - Archivador devuelto
4. **Rechazado** - Solicitud denegada

**Endpoints Backend:**
```
GET    /api/prestamos                     # Listar préstamos
GET    /api/prestamos/:id                 # Obtener detalle
POST   /api/prestamos                     # Solicitar préstamo
PUT    /api/prestamos/:id                 # Actualizar solicitud
POST   /api/prestamos/:id/aprobar         # Aprobar solicitud
POST   /api/prestamos/:id/rechazar        # Rechazar solicitud
POST   /api/prestamos/:id/devolver        # Devolver archivador
```

**Componentes Frontend:**
- `PrestamosPage.tsx` - Listado de préstamos
- `PrestamoNuevoPage.tsx` - Crear solicitud
- `PrestamoEditarPage.tsx` - Editar solicitud
- `PrestamoDetallePage.tsx` - Ver detalles

**Archivos Principales:**
```
Backend:  prestamoController.js, prestamoService.js,
          PrestamoArchivador.js, prestamoValidator.js
Frontend: PrestamosPage.tsx, PrestamoNuevoPage.tsx,
          PrestamoEditarPage.tsx, PrestamoDetallePage.tsx,
          prestamoService.ts
```

**Permisos Requeridos:**
- `prestamos_request` - Solicitar préstamos
- `prestamos_approve` - Aprobar/rechazar
- `prestamos_admin` - Gestión completa

---

### 6. **Módulo de Auditoría** 📊

**Descripción:** Registro completo y búsqueda de todas las acciones realizadas en el sistema.

**Funcionalidades:**
- ✅ Registro automático de todas las acciones
- ✅ Tracking de cambios en documentos
- ✅ Historial de usuario (quién, qué, cuándo)
- ✅ Búsqueda avanzada por usuario, tipo de acción, fecha
- ✅ Filtrado por módulo (documentos, usuarios, etc.)
- ✅ Exportación de auditoría
- ✅ Información de IP y User Agent
- ✅ Retención configurable de logs
- ✅ Prevención de modificación de logs

**Tipos de Acciones Auditadas:**
- Autenticación (LOGIN, LOGOUT)
- Documentos (CREATE, UPDATE, DELETE, RESTORE)
- Usuarios (CREATE, UPDATE, DELETE, PASSWORD_RESET)
- Préstamos (REQUEST, APPROVE, REJECT, RETURN)
- Configuración (CONFIG_CHANGE)
- Y más...

**Endpoints Backend:**
```
GET    /api/audit                         # Listar auditoría
GET    /api/audit/:id                     # Obtener detalle
GET    /api/audit/user/:userId            # Auditoría de usuario
GET    /api/audit/document/:docId         # Cambios del documento
GET    /api/audit/export                  # Exportar auditoría
```

**Componentes Frontend:**
- `AuditoriaPage.tsx` - Búsqueda y listado de auditoría
- `DataTable.tsx` - Tabla de eventos
- Filtros por fecha, usuario, tipo de acción

**Archivos Principales:**
```
Backend:  auditController.js, auditService.js, Auditoria.js
Frontend: AuditoriaPage.tsx, auditService.ts
```

**Permisos Requeridos:**
- `system_admin` - Acceso a auditoría

---

### 7. **Módulo de Reportes** 📈

**Descripción:** Análisis y visualización de datos del sistema con gráficas y exportaciones.

**Funcionalidades:**
- ✅ Dashboard con estadísticas principales
- ✅ Gráficas interactivas (Pie, Bar, Line)
- ✅ Documentos por área
- ✅ Documentos por tipo
- ✅ Documentos por estado
- ✅ Actividad reciente de usuarios
- ✅ Filtrado por período (día, mes, año)
- ✅ Exportación a PDF/Excel
- ✅ Generación de reportes personalizados
- ✅ Datos en tiempo real

**Gráficas Disponibles:**
1. **Estado de Documentos** (Pie Chart)
   - Registrado, En Proceso, Archivado, Prestado

2. **Documentos por Área** (Bar Chart)
   - Comparativa de documentos por cada área

3. **Documentos por Tipo** (Horizontal Bar)
   - Distribución según tipo de documento

4. **Actividad de Usuarios** (Table)
   - Últimas acciones de usuarios

**Endpoints Backend:**
```
GET    /api/reports/dashboard             # Estadísticas principales
GET    /api/reports/by-area               # Documentos por área
GET    /api/reports/by-tipo               # Documentos por tipo
GET    /api/reports/by-estado             # Documentos por estado
GET    /api/reports/user-activity         # Actividad de usuarios
GET    /api/reports/export                # Exportar reportes
```

**Componentes Frontend:**
- `DashboardPage.tsx` - Dashboard principal
- `ReportesPage.tsx` - Generador de reportes avanzados
- Gráficas con Recharts
- Exportación con html2canvas/pdfkit

**Archivos Principales:**
```
Backend:  reportController.js, reportService.js
Frontend: DashboardPage.tsx, ReportesPage.tsx, reportService.ts
```

**Permisos Requeridos:**
- `reports_access` - Acceso a reportes

---

### 8. **Módulo de Configuración** ⚙️

**Descripción:** Gestión centralizada de áreas, archivadores, tipos de documentos y parámetros del sistema.

#### 8.1 **Sub-módulo: Áreas Organizacionales**

**Funcionalidades:**
- ✅ Crear nuevas áreas
- ✅ Editar información de área (nombre, siglas)
- ✅ Eliminar áreas (si no tienen documentos)
- ✅ Activar/desactivar áreas
- ✅ Asignación de usuarios a áreas
- ✅ Visualización de archivadores por área
- ✅ Visualización de documentos por área

**Endpoints:**
```
GET    /api/areas                         # Listar áreas
GET    /api/areas/:id                     # Obtener área
POST   /api/areas                         # Crear área
PUT    /api/areas/:id                     # Editar área
DELETE /api/areas/:id                     # Eliminar área
```

#### 8.2 **Sub-módulo: Archivadores**

**Funcionalidades:**
- ✅ Crear archivadores en áreas
- ✅ Definir capacidad máxima (folios)
- ✅ Asignar tipo de documento que contiene
- ✅ Visualizar ocupación actual
- ✅ Identificar archivadores llenos
- ✅ Transferir entre áreas
- ✅ Historial de documentos almacenados
- ✅ Estado: Disponible, Lleno, Archivado, En Préstamo

**Endpoints:**
```
GET    /api/archivadores                  # Listar archivadores
GET    /api/archivadores/:id              # Obtener detalle
POST   /api/archivadores                  # Crear archivador
PUT    /api/archivadores/:id              # Editar archivador
DELETE /api/archivadores/:id              # Eliminar archivador
POST   /api/archivadores/:id/transfer     # Transferir área
GET    /api/archivadores/:id/documentos   # Documentos almacenados
```

#### 8.3 **Sub-módulo: Tipos de Documento**

**Funcionalidades:**
- ✅ Crear nuevos tipos de documento
- ✅ Editar tipos existentes
- ✅ Eliminar tipos (si no están en uso)
- ✅ Descripción y referencias del tipo
- ✅ Validación de formato de prenombre
- ✅ 15 tipos predefinidos del sistema

**Tipos Predefinidos:**
- Acuerdo de Consejo
- Carta
- Decreto de Alcaldía
- Informe Emitido/Recibido
- Memorando
- Oficio Emitido/Recibido
- Ordenanza Municipal
- Resoluciones (múltiples)

**Endpoints:**
```
GET    /api/tipos-documento                # Listar tipos
GET    /api/tipos-documento/:id            # Obtener tipo
POST   /api/tipos-documento                # Crear tipo
PUT    /api/tipos-documento/:id            # Editar tipo
DELETE /api/tipos-documento/:id            # Eliminar tipo
```

#### 8.4 **Sub-módulo: Parámetros del Sistema**

**Funcionalidades:**
- ✅ Configurar capacidad máxima de archivador
- ✅ Configurar retención de auditoría
- ✅ Configurar parámetros de email
- ✅ Configurar idioma del sistema
- ✅ Ver versión del sistema
- ✅ Configurar URLs de base de datos

**Parámetros Disponibles:**
- `capacidad_maxima_archivador` (default: 500 folios)
- `dias_retencion_auditoria` (default: 2555 días / 7 años)
- `version_sistema` (readonly)

**Endpoints:**
```
GET    /api/config                        # Obtener parámetros
PUT    /api/config/:key                   # Actualizar parámetro
POST   /api/config/backup                 # Crear backup
POST   /api/config/restore                # Restaurar backup
```

**Componentes Frontend:**
- `ConfiguracionPage.tsx` - Parámetros del sistema
- `AreasPage.tsx` - Gestión de áreas
- `AreaNuevoPage.tsx` - Crear área
- `AreaEditarPage.tsx` - Editar área
- `ArchivadoresPage.tsx` - Gestión de archivadores
- `ArchivadorNuevoPage.tsx` - Crear archivador
- `ArchivadorEditarPage.tsx` - Editar archivador
- `TiposDocumentoPage.tsx` - Gestión de tipos
- `TipoDocumentoNuevoPage.tsx` - Crear tipo
- `TipoDocumentoEditarPage.tsx` - Editar tipo

**Archivos Principales:**
```
Backend:  configController.js, configService.js,
          areaController.js, areaService.js, Area.js,
          archivadorController.js, archivadorService.js, Archivador.js,
          tipoDocumentoController.js, tipoDocumentoService.js,
          TipoDocumento.js, ConfiguracionSistema.js
Frontend: ConfiguracionPage.tsx, AreasPage.tsx, AreaNuevoPage.tsx,
          AreaEditarPage.tsx, ArchivadoresPage.tsx,
          ArchivadorNuevoPage.tsx, ArchivadorEditarPage.tsx,
          TiposDocumentoPage.tsx, TipoDocumentoNuevoPage.tsx,
          TipoDocumentoEditarPage.tsx, configService.ts,
          areaService.ts, archivadorService.ts,
          tipoDocumentoService.ts
```

**Permisos Requeridos:**
- `areas_read` / `areas_write` / `areas_admin` - Áreas
- `arch_read` / `arch_write` / `arch_admin` - Archivadores
- `tipos_read` / `tipos_write` - Tipos de documento
- `system_admin` - Configuración general

---

### 9. **Módulo de Control de Sesiones** ⏱️

**Descripción:** Sistema avanzado de gestión de sesiones con timeout automático y sincronización multi-ventana.

**Funcionalidades:**
- ✅ Timeout automático después de 5 minutos de inactividad
- ✅ Advertencia modal 1 minuto antes del cierre
- ✅ Extender sesión al hacer click en "Continuar sesión"
- ✅ Detección de actividad: mouse, teclado, scroll, touch
- ✅ Sincronización entre múltiples pestañas/ventanas
- ✅ BroadcastChannel para comunicación entre tabs
- ✅ Logout automático en todas las ventanas
- ✅ Encriptación segura de tokens en localStorage

**Componentes Frontend:**
- `InactivityWarningModal.tsx` - Modal de advertencia
- `useInactivityLogout.ts` - Hook de detección de inactividad
- `AuthProvider.tsx` - Integración en auth context

**Archivos Principales:**
```
Frontend: InactivityWarningModal.tsx, useInactivityLogout.ts,
          AuthProvider.tsx, encryption.ts
```

**Configuración:**
```javascript
// Tiempos en ms
INACTIVITY_TIMEOUT = 5 * 60 * 1000      // 5 minutos
WARNING_TIME = 1 * 60 * 1000            // Mostrar warning 1 min antes
```

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Flujo de Autenticación

```
┌─────────────────┐
│   Usuario       │
└────────┬────────┘
         │ Login (email/password)
         ▼
┌─────────────────────────────────┐
│   Frontend: LoginPage.tsx        │
│   - Validación básica            │
│   - Encriptación de contraseña   │
└────────┬────────────────────────┘
         │ POST /api/auth/login
         ▼
┌─────────────────────────────────┐
│   Backend: authController       │
│   - Recibe credenciales         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Backend: authService.js       │
│   - Busca usuario (email/nombre)│
│   - Verifica contraseña (bcrypt)│
└────────┬────────────────────────┘
         │
      ┌──┴──┐
      │     │
   Válido  Inválido
      │      │
      ▼      ▼
   ┌──┐   Retorna 401
   │Sí│
   └──┘
      │
      ▼
┌──────────────────────────────┐
│   Generar Tokens:            │
│   - Access Token (JWT 24h)   │
│   - Refresh Token (7 días)   │
│   - Registrar en BD          │
└──────────┬───────────────────┘
           │ Response: {accessToken, refreshToken, user}
           ▼
┌──────────────────────────────┐
│   Frontend: Almacenar tokens │
│   - Encriptar con CryptoJS   │
│   - Guardar en localStorage  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   Redirigir a Dashboard      │
│   - Set BroadcastChannel     │
│   - Iniciar detección        │
│     de inactividad           │
└──────────────────────────────┘
```

### Diagrama de Flujo de Crear Documento

```
┌─────────────────────────────┐
│  Usuario: DocumentoNuevoPage│
└────────┬────────────────────┘
         │ Selecciona:
         │ - Área origen
         │ - Archivador
         │ (auto-asigna tipo_documento)
         ▼
┌────────────────────────────────┐
│  Frontend: Validación básica   │
│  - Campos requeridos           │
│  - Tipo de documento válido    │
└────────┬───────────────────────┘
         │ POST /api/documentos
         │ + archivo + metadatos
         ▼
┌────────────────────────────────┐
│  Backend: documentoController  │
│  - Recibe datos                │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Backend: documentoService     │
│  - Genera prenombre            │
│    (TipoDco nnnn-YYYY-Sigla)   │
│  - Valida archivador/tipo_doc  │
│  - Valida capacidad archivador │
└────────┬───────────────────────┘
         │
      ┌──┴──┐
      │     │
    Válido Inválido
      │      │
      ▼      ▼
   ┌──┐   Retorna 400
   │Sí│
   └──┘
      │
      ▼
┌────────────────────────────────┐
│  Base de Datos:                │
│  INSERT INTO documentos:       │
│  - prenombre (generado)        │
│  - nombre_documento            │
│  - id_area_origen              │
│  - id_archivador               │
│  - id_tipo_documento           │
│  - id_usuario_creador          │
│  - fecha_creacion = NOW()      │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Carga de Archivo (Multer):    │
│  - Valida tipo MIME            │
│  - Copia a carpeta /uploads    │
│  - Registra ruta en documento  │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Auditoría:                    │
│  INSERT INTO auditoria:        │
│  - id_usuario                  │
│  - accion = 'CREATE'           │
│  - descripcion                 │
│  - fecha_accion = NOW()        │
│  - ip_address                  │
│  - user_agent                  │
└────────┬───────────────────────┘
         │ Response: {success: true, data: documento}
         ▼
┌────────────────────────────────┐
│  Frontend: Actualizar listado  │
│  - React Query revalidate      │
│  - Toast de éxito              │
│  - Redirigir a documento/lista │
└────────────────────────────────┘
```

### Diagrama de Permisos

```
ADMINISTRADOR
├── auth_login
├── auth_profile
├── docs_* (todos)
├── areas_* (todos)
├── arch_* (todos)
├── tipos_* (todos)
├── prestamos_* (todos)
├── users_* (todos)
├── reports_access
└── system_admin

SUPERVISOR
├── auth_login
├── auth_profile
├── docs_read, create, edit, upload, stats
├── areas_read, write
├── arch_read, write, transfer
├── tipos_read, write
├── prestamos_request, approve
├── users_read
├── reports_access
└── ❌ system_admin

REGISTRADOR
├── auth_login
├── auth_profile
├── docs_read, create, edit, upload
├── areas_read
├── arch_read, write
├── tipos_read
├── prestamos_request
├── ❌ users_admin
├── reports_access
└── ❌ system_admin

CONSULTOR
├── auth_login
├── auth_profile
├── docs_read
├── areas_read
├── arch_read
├── ❌ docs_create, edit, delete, upload
├── ❌ prestamos_approve
└── ❌ system_admin
```

### Diagrama de Estados de Documento

```
     ┌─────────────────────────────────┐
     │  REGISTRADO                     │
     │  Estado inicial del documento   │
     └──────────┬──────────────────────┘
                │
     ┌──────────▼──────────┐
     │  EN PROCESO         │
     │  Siendo archivado   │
     └──────────┬──────────┘
                │
     ┌──────────▼──────────┐
     │  ARCHIVADO          │
     │  En el archivador   │
     ├──────────┬──────────┤
     │          │          │
   Leer      Préstamo      │
     │          │          │
     └──────────┼──────────┘
                │
     ┌──────────▼──────────┐
     │  PRESTADO           │
     │  Fuera del archivo  │
     │  (Temporal)         │
     └──────────┬──────────┘
                │
        Devolución
                │
     ┌──────────▼──────────┐
     │  ARCHIVADO (nuevamente)
     └─────────────────────┘
```

---

## 📊 Estructura de Datos Principal

### Tablas Principales

```sql
-- Usuarios y Autenticación
usuarios
  ├── id_usuario (PK)
  ├── nombre_usuario (UNIQUE)
  ├── email (UNIQUE)
  ├── password (bcrypt)
  ├── nombres, apellidos
  ├── id_rol (FK)
  ├── id_area (FK)
  ├── estado (boolean)
  └── fecha_creacion

-- Documentos
documentos
  ├── id_documento (PK)
  ├── prenombre (UNIQUE, auto-generado)
  ├── nombre_documento
  ├── descripcion
  ├── id_area_origen (FK)
  ├── id_archivador (FK)
  ├── id_tipo_documento (FK)
  ├── id_estado (FK)
  ├── id_usuario_creador (FK)
  ├── ruta_archivo
  ├── fecha_creacion
  ├── fecha_modificacion
  ├── eliminado (soft delete)
  └── fecha_eliminacion

-- Configuración
areas
  ├── id_area (PK)
  ├── nombre_area
  ├── siglas
  ├── id_organizacion (FK)
  └── estado

archivadores
  ├── id_archivador (PK)
  ├── codigo_archivador (UNIQUE)
  ├── id_area_origen (FK)
  ├── id_tipo_documento_contenido (FK)
  ├── capacidad_maxima
  ├── ocupacion_actual
  ├── estado
  └── fecha_creacion

tipos_documento
  ├── id_tipo_documento (PK)
  ├── nombre_tipo
  └── descripcion

-- Seguridad
roles
  ├── id_rol (PK)
  ├── nombre_rol
  └── descripcion

permisos
  ├── id_permiso (PK)
  ├── nombre_permiso
  └── descripcion

roles_permisos
  ├── id_rol (FK)
  ├── id_permiso (FK)
  └── (PK: id_rol, id_permiso)

-- Auditoría
auditoria
  ├── id_auditoria (PK)
  ├── id_usuario (FK)
  ├── accion (CREATE, UPDATE, DELETE, etc.)
  ├── descripcion
  ├── fecha_accion
  ├── ip_address
  ├── user_agent
  └── detalles_cambio (JSON)

-- Préstamos
prestamos_archivadores
  ├── id_prestamo (PK)
  ├── id_archivador (FK)
  ├── id_usuario_solicitante (FK)
  ├── id_usuario_aprobador (FK)
  ├── estado (Pendiente, Aprobado, Rechazado, Devuelto)
  ├── motivo_solicitud
  ├── fecha_solicitud
  ├── fecha_aprobacion
  ├── fecha_devolución
  └── observaciones
```

---

## 🔐 Flujo de Seguridad

### Autenticación (JWT)

```
┌─────────────┐
│  Credenciales│
│  (email/pwd) │
└──────┬──────┘
       │
       ▼
   Validar
   (bcrypt)
       │
   ┌───┴───┐
   │       │
  Válido  Inválido
   │       └─► 401 Unauthorized
   │
   ▼
Generar JWT
   │
   ├─► Access Token (24h)
   │   ├─ id_usuario
   │   ├─ email
   │   ├─ rol
   │   └─ permisos[]
   │
   └─► Refresh Token (7d)
       └─ Guardar en BD

Frontend:
   │
   ├─► Encriptar tokens (CryptoJS)
   │   ├─ Validación SHA256
   │   └─ Timestamp (max 7 días en prod)
   │
   └─► Almacenar en localStorage

Usar Token:
   │
   ├─► Header: Authorization: Bearer {access_token}
   │
   └─► authMiddleware valida:
       ├─ Token expirado?
       ├─ Firma válida?
       └─ Usuario existe?
```

### Autorización (RBAC)

```
┌──────────────┐
│  Request API │
└──────┬───────┘
       │
       ▼
authMiddleware
├─ Verifica JWT
└─ Extrae usuario
       │
       ▼
permissionMiddleware
├─ Obtiene rol del usuario
├─ Obtiene permisos del rol
└─ Verifica permiso requerido
       │
   ┌───┴───┐
   │       │
  Tiene   No tiene
   │       └─► 403 Forbidden
   │
   ▼
Acceder a recurso
```

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
