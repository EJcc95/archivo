SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
-- =====================================================
-- 1. TABLA: organizacion (Fundamental - Primera en jerarquía)
-- =====================================================
INSERT INTO `organizacion` (
    `id_organizacion`,
    `nombre`,
    `ruc`,
    `direccion`,
    `telefono`,
    `email`
  )
VALUES (
    1,
    'Municipalidad Distrital De Nuevo Imperial',
    '20148181544',
    'Jr. Manchego Muñoz N° 410 - Nuevo Imperial - Cañete - Lima',
    NULL,
    NULL
  );
-- =====================================================
-- 2. TABLA: areas (Depende de organizacion)
-- =====================================================
INSERT INTO `areas` (
    `id_area`,
    `id_organizacion`,
    `nombre_area`,
    `siglas`,
    `estado`,
    `fecha_creacion`,
    `fecha_modificacion`
  )
VALUES (
    1,
    1,
    'Alcaldía',
    'ALC',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    2,
    1,
    'Gerencia Municipal',
    'GM',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    3,
    1,
    'Oficina de Secretaría General',
    'OSG',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    4,
    1,
    'Unidad de Registro Civil',
    'URC',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    5,
    1,
    'Unidad de Archivo Central',
    'UAC',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    6,
    1,
    'Unidad de Trámite Documentario',
    'UTD',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    7,
    1,
    'Unidad de Imagen Institucional',
    'UII',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    8,
    1,
    'Oficina General de Administración y Finanzas',
    'OGAF',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    9,
    1,
    'Oficina de Contabilidad',
    'OC',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    10,
    1,
    'Oficina de Tesorería',
    'OT',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    11,
    1,
    'Oficina de Gestión de Recursos Humanos',
    'OGRRHH',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    12,
    1,
    'Oficina de Logística, Control Patrimonial y Maestranza',
    'OLCPM',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    13,
    1,
    'Oficina General de Planeamiento, Presupuesto y Tecnología de la Información',
    'OGPPTI',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    14,
    1,
    'Oficina de Programación Multianual de Inversiones (OPMI)',
    'OPMI',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    15,
    1,
    'Unidad de Tecnología de la Información',
    'UTI',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    16,
    1,
    'Oficina General de Asesoría Jurídica',
    'OGAJ',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    17,
    1,
    'Gerencia de Desarrollo Urbano y Rural',
    'GDUR',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    18,
    1,
    'Subgerencia de Obras Públicas y Liquidaciones',
    'SGOPL',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    19,
    1,
    'Subgerencia de Obras Privadas, Habilitaciones Urbanas y Catastro',
    'SGOPHUC',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    20,
    1,
    'Subgerencia de Proyectos de Inversión',
    'SGPI',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    21,
    1,
    'Subgerencia de Gestión de Riesgos y Desastres (Defensa Civil)',
    'SGRD',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    22,
    1,
    'División del Área Técnica Municipal (ATM)',
    'ATM',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    23,
    1,
    'Gerencia de Administración Tributaria y Rentas',
    'GATR',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    24,
    1,
    'Subgerencia de Orientación, Registro y Recaudación',
    'SGORR',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    25,
    1,
    'Subgerencia de Fiscalización Tributaria',
    'SGFT',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    26,
    1,
    'Subgerencia de Ejecutoria Coactiva',
    'SGEC',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    27,
    1,
    'Gerencia de Desarrollo Humano y Protección Social',
    'GDHPS',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    28,
    1,
    'Subgerencia de Participación Vecinal, Educación, Cultura y Deporte',
    'SPVECD',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    29,
    1,
    'Subgerencia de Programas Sociales',
    'SPS',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    30,
    1,
    'División de DEMUNA',
    'DEMUNA',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    31,
    1,
    'División de OMAPED',
    'OMAPED',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    32,
    1,
    'División de CIAM',
    'CIAM',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    33,
    1,
    'División de Vaso de Leche',
    'PVL',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    34,
    1,
    'División de ULE',
    'ULE',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    35,
    1,
    'Gerencia de Servicios Públicos y Desarrollo Económico',
    'GSPDE',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    36,
    1,
    'Subgerencia de Medio Ambiente, Limpieza Pública y Áreas Verdes',
    'SMALPAV',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    37,
    1,
    'Subgerencia de Seguridad Ciudadana, Transporte y Seguridad Vial',
    'SSCTSV',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    38,
    1,
    'Subgerencia de Promoción Empresarial, Autorizaciones Comerciales y Turismo',
    'SPEACT',
    1,
    '2025-10-03 17:53:17',
    NULL
  ),
  (
    39,
    1,
    'Subgerencia de Fiscalización Administrativa',
    'SFA',
    1,
    '2025-10-03 17:53:17',
    NULL
  );
-- =====================================================
-- 3. TABLA: roles (Independiente - Gestión de seguridad)
-- =====================================================
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`)
VALUES (1, 'Administrador', 'Control total del sistema'),
  (
    2,
    'Registrador',
    'Puede registrar y consultar documentos'
  ),
  (
    3,
    'Consultor',
    'Solo puede ver y buscar documentos'
  ),
  (
    4,
    'Supervisor',
    'Gestión intermedia - Supervisión de documentos y áreas'
  );
-- =====================================================
-- 4. TABLA: permisos (Independiente - Gestión de seguridad)
-- =====================================================
INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`, `descripcion`)
VALUES (
    1,
    'auth_login',
    'Iniciar/cerrar sesión, renovar tokens de acceso'
  ),
  (
    2,
    'auth_profile',
    'Ver y editar perfil propio, cambiar contraseña'
  ),
  (
    3,
    'docs_read',
    'Ver, buscar y descargar documentos del sistema'
  ),
  (
    4,
    'docs_create',
    'Registrar nuevos documentos en el sistema'
  ),
  (
    5,
    'docs_edit',
    'Editar información y metadata de documentos existentes'
  ),
  (
    6,
    'docs_delete',
    'Eliminar y restaurar documentos del sistema'
  ),
  (
    7,
    'docs_upload',
    'Subir y gestionar archivos digitales'
  ),
  (
    8,
    'docs_stats',
    'Ver estadísticas y reportes de documentos'
  ),
  (
    9,
    'areas_read',
    'Ver áreas organizacionales y sus documentos/archivadores'
  ),
  (
    10,
    'areas_write',
    'Crear y editar información de áreas organizacionales'
  ),
  (
    11,
    'areas_admin',
    'Activar, desactivar y administrar áreas del sistema'
  ),
  (
    12,
    'arch_read',
    'Ver archivadores y consultar su capacidad'
  ),
  (
    13,
    'arch_write',
    'Crear, editar y gestionar archivadores'
  ),
  (
    14,
    'arch_transfer',
    'Transferir y reasignar archivadores entre áreas'
  ),
  (
    15,
    'arch_admin',
    'Gestión avanzada y administración de archivadores'
  ),
  (
    16,
    'tipos_read',
    'Ver y consultar tipos de documento'
  ),
  (
    17,
    'tipos_write',
    'Crear, editar y administrar tipos de documento'
  ),
  (
    18,
    'prestamos_request',
    'Crear y ver propias solicitudes de préstamo'
  ),
  (
    19,
    'prestamos_approve',
    'Aprobar, rechazar y gestionar devoluciones'
  ),
  (
    20,
    'prestamos_admin',
    'Gestión completa del sistema de préstamos'
  ),
  (
    21,
    'users_read',
    'Ver información de usuarios del sistema'
  ),
  (
    22,
    'users_admin',
    'Crear, editar usuarios y gestionar roles/permisos'
  ),
  (
    23,
    'reports_access',
    'Acceso a dashboard, reportes y exportaciones'
  ),
  (
    24,
    'system_admin',
    'Configuración del sistema, auditoría y mantenimiento'
  );
-- =====================================================
-- 5. TABLA: roles_permisos (Depende de roles y permisos)
-- =====================================================
INSERT INTO `roles_permisos` (`id_rol`, `id_permiso`)
VALUES -- Administrador (Todos los permisos)
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (1, 8),
  (1, 9),
  (1, 10),
  (1, 11),
  (1, 12),
  (1, 13),
  (1, 14),
  (1, 15),
  (1, 16),
  (1, 17),
  (1, 18),
  (1, 19),
  (1, 20),
  (1, 21),
  (1, 22),
  (1, 23),
  (1, 24),
  -- Registrador (Permisos de registro y consulta)
  (2, 1),
  (2, 2),
  (2, 3),
  (2, 4),
  (2, 5),
  (2, 7),
  (2, 9),
  (2, 12),
  (2, 13),
  (2, 16),
  (2, 18),
  (2, 23),
  -- Consultor (Solo lectura)
  (3, 1),
  (3, 2),
  (3, 3),
  (3, 9),
  (3, 12),
  -- Supervisor (Gestión intermedia)
  (4, 1),
  (4, 2),
  (4, 3),
  (4, 4),
  (4, 5),
  (4, 7),
  (4, 8),
  (4, 9),
  (4, 10),
  (4, 12),
  (4, 13),
  (4, 14),
  (4, 16),
  (4, 17),
  (4, 18),
  (4, 19),
  (4, 21),
  (4, 23);
-- =====================================================
-- 6. TABLA: usuarios (Depende de organizacion y roles)
-- =====================================================
INSERT INTO `usuarios` (
    `id_usuario`,
    `id_organizacion`,
    `nombre_usuario`,
    `password`,
    `nombres`,
    `apellidos`,
    `email`,
    `id_rol`,
    `id_area`,
    `estado`,
    `fecha_creacion`
  )
VALUES (
    1,
    1,
    'erinzon',
    '$2a$12$2l1BPhDAAlUyd9pk/d94Ze5pdXt37mlUkKuurI6atSxa7EIu5UyLG',
    'Erinzon',
    'Cuzcano',
    'erinzon1995@gmail.com',
    1,
    15,
    1,
    '2025-10-03 17:52:47'
  ),
  (
    2,
    1,
    'genoveva',
    '$2a$12$Cr5qW0Su0LVtYndO0GwX3eyBTlEjHca4obv/eXwlNgA9TDhT10lD.',
    'Genoveva',
    'De la Cruz',
    'gdelacruz@muniejemplo.gob.pe',
    2,
    5,
    1,
    '2025-10-03 17:52:47'
  );
-- =====================================================
-- 7. TABLA: tipos_documento (Independiente - Catálogo)
-- =====================================================
-- =====================================================
-- 7. TABLA: tipos_documento (Independiente - Catálogo)
-- =====================================================
INSERT INTO `tipos_documento` (
    `id_tipo_documento`,
    `nombre_tipo`,
    `descripcion`
  )
VALUES (1, 'Acuerdo de Consejo', NULL),
  (2, 'Carta', NULL),
  (3, 'Decreto de Alcaldía', NULL),
  (4, 'Informe Emitido', NULL),
  (5, 'Informe Recibido', NULL),
  (6, 'Memorando', NULL),
  (7, 'Oficio Emitido', NULL),
  (8, 'Oficio Recibido', NULL),
  (9, 'Ordenanza Municipal', NULL),
  (10, 'Resolución de Administración y Finanzas', NULL),
  (11, 'Resolucion de Alcaldia', NULL),
  (12, 'Resolución de Gerencia de Administración Tributaria y Rentas', NULL),
  (13, 'Resolución de Gerencia de Desarrollo Urbano y Rural', NULL),
  (14, 'Resolución de Gerencia Municipal', NULL),
  (15, 'Resolución de Gerencia de Servicios Públicos', NULL);
-- =====================================================
-- 8. TABLA: estados_documento (Independiente - Catálogo)
-- =====================================================
INSERT INTO `estados_documento` (
    `id_estado`,
    `nombre_estado`,
    `descripcion`,
    `activo`
  )
VALUES (
    1,
    'Registrado',
    'Documento registrado en el sistema',
    1
  ),
  (
    2,
    'En Proceso',
    'Documento en proceso de archivado',
    1
  ),
  (
    3,
    'Archivado',
    'Documento archivado físicamente',
    1
  ),
  (4, 'Prestado', 'Documento en préstamo', 1);
-- =====================================================
-- 09. TABLA: configuracion_sistema (Independiente - Configuración)
-- =====================================================
INSERT INTO `configuracion_sistema` (
    `id_config`,
    `clave`,
    `valor`,
    `descripcion`,
    `fecha_modificacion`
  )
VALUES (
    1,
    'capacidad_maxima_archivador',
    '500',
    'Capacidad máxima de folios por archivador',
    '2025-10-09 15:59:40'
  ),
  (
    2,
    'dias_retencion_auditoria',
    '2555',
    'Días de retención de registros de auditoría',
    '2025-10-03 17:53:17'
  ),
  (
    3,
    'version_sistema',
    '1.0',
    'Versión actual del sistema',
    '2025-10-03 17:53:17'
  );
COMMIT;