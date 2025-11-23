SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- =====================================================
-- Creación de tablas base
-- =====================================================

-- Tabla: organizacion
DROP TABLE IF EXISTS `organizacion`;
CREATE TABLE `organizacion` (
  `id_organizacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `ruc` varchar(11) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_organizacion`),
  UNIQUE KEY `organizacion_ruc` (`ruc`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: areas
DROP TABLE IF EXISTS `areas`;
CREATE TABLE `areas` (
  `id_area` int NOT NULL AUTO_INCREMENT,
  `id_organizacion` int NOT NULL DEFAULT '1',
  `nombre_area` varchar(255) NOT NULL,
  `siglas` varchar(50) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_area`),
  KEY `idx_areas_estado` (`estado`),
  KEY `idx_areas_nombre` (`nombre_area`),
  KEY `idx_areas_siglas` (`siglas`),
  CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id_organizacion`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: permisos
DROP TABLE IF EXISTS `permisos`;
CREATE TABLE `permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `nombre_permiso` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `nombre_permiso` (`nombre_permiso`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_organizacion` int NOT NULL DEFAULT '1',
  `nombre_usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombres` varchar(75) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `id_rol` int NOT NULL,
  `id_area` int DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuarios_email_estado` (`email`, `estado`),
  KEY `idx_usuarios_rol` (`id_rol`),
  KEY `idx_usuarios_area` (`id_area`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id_organizacion`),
  CONSTRAINT `usuarios_ibfk_3` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: roles_permisos
DROP TABLE IF EXISTS `roles_permisos`;
CREATE TABLE `roles_permisos` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`, `id_permiso`),
  CONSTRAINT `roles_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `roles_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: tipos_documento
DROP TABLE IF EXISTS `tipos_documento`;
CREATE TABLE `tipos_documento` (
  `id_tipo_documento` int NOT NULL AUTO_INCREMENT,
  `nombre_tipo` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_tipo_documento`),
  KEY `idx_tipos_documento_nombre` (`nombre_tipo`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: estados_documento
DROP TABLE IF EXISTS `estados_documento`;
CREATE TABLE `estados_documento` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(50) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre_estado` (`nombre_estado`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: archivadores (Con mejora de CHECK constraint)
DROP TABLE IF EXISTS `archivadores`;
CREATE TABLE `archivadores` (
  `id_archivador` int NOT NULL AUTO_INCREMENT,
  `nombre_archivador` varchar(50) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `id_area_propietaria` int NOT NULL,
  `id_tipo_documento_contenido` int NOT NULL,
  `total_folios` int NOT NULL DEFAULT '0',
  `ubicacion_fisica` varchar(255) DEFAULT NULL,
  `fecha_creacion` date NOT NULL,
  `id_usuario_creacion` int DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `id_usuario_modificacion` int DEFAULT NULL,
  `estado` enum('Abierto', 'Cerrado', 'En Custodia') NOT NULL DEFAULT 'Abierto',
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_eliminacion` datetime NULL DEFAULT NULL,
  `id_usuario_eliminacion` int DEFAULT NULL,
  PRIMARY KEY (`id_archivador`),
  UNIQUE KEY `nombre_archivador` (`nombre_archivador`),
  KEY `idx_archivadores_area_tipo` (`id_area_propietaria`, `id_tipo_documento_contenido`, `eliminado`),
  CONSTRAINT `chk_folios_no_negativos` CHECK (`total_folios` >= 0),
  CONSTRAINT `archivadores_ibfk_1` FOREIGN KEY (`id_area_propietaria`) REFERENCES `areas` (`id_area`),
  CONSTRAINT `archivadores_ibfk_2` FOREIGN KEY (`id_tipo_documento_contenido`) REFERENCES `tipos_documento` (`id_tipo_documento`),
  CONSTRAINT `archivadores_ibfk_3` FOREIGN KEY (`id_usuario_creacion`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `archivadores_ibfk_4` FOREIGN KEY (`id_usuario_modificacion`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: documentos (Con mejoras de auditoría de modificación)
DROP TABLE IF EXISTS `documentos`;
CREATE TABLE `documentos` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `nombre_documento` varchar(100) NOT NULL,
  `asunto` text NOT NULL,
  `fecha_documento` date NOT NULL,
  `numero_folios` int NOT NULL DEFAULT '1',
  `observaciones` text,
  `ruta_archivo_digital` varchar(255) DEFAULT NULL,
  `id_tipo_documento` int NOT NULL,
  `id_area_origen` int NOT NULL,
  `id_area_destino` int DEFAULT NULL,
  `destinatario_externo` varchar(200) DEFAULT NULL,
  `id_archivador` int DEFAULT NULL,
  `id_archivador_original` int DEFAULT NULL,
  `id_usuario_registro` int NOT NULL,
  `fecha_registro_sistema` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_modificacion` int DEFAULT NULL, -- Nuevo campo
  `fecha_modificacion` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, -- Nuevo campo
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_eliminacion` timestamp NULL DEFAULT NULL,
  `id_usuario_eliminacion` int DEFAULT NULL,
  `id_estado` int NOT NULL DEFAULT '1',
  `fecha_ultima_consulta` timestamp NULL DEFAULT NULL,
  `numero_consultas` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_documento`),
  FULLTEXT KEY `idx_documentos_fulltext` (`nombre_documento`),
  FULLTEXT KEY `idx_fulltext_asunto` (`asunto`),
  KEY `idx_documentos_fecha_desc` (`fecha_documento` DESC, `eliminado`),
  KEY `idx_documentos_huerfanos` (`id_archivador`, `eliminado`, `fecha_documento` DESC),
  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipos_documento` (`id_tipo_documento`),
  CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`id_area_origen`) REFERENCES `areas` (`id_area`),
  CONSTRAINT `documentos_ibfk_3` FOREIGN KEY (`id_area_destino`) REFERENCES `areas` (`id_area`),
  CONSTRAINT `documentos_ibfk_4` FOREIGN KEY (`id_archivador`) REFERENCES `archivadores` (`id_archivador`),
  CONSTRAINT `documentos_ibfk_5` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `documentos_ibfk_6` FOREIGN KEY (`id_usuario_eliminacion`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `documentos_ibfk_7` FOREIGN KEY (`id_estado`) REFERENCES `estados_documento` (`id_estado`),
  CONSTRAINT `fk_docs_user_mod` FOREIGN KEY (`id_usuario_modificacion`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: prestamos_archivadores
DROP TABLE IF EXISTS `prestamos_archivadores`;
CREATE TABLE `prestamos_archivadores` (
  `id_prestamo` int NOT NULL AUTO_INCREMENT,
  `id_archivador` int NOT NULL,
  `id_area_solicitante` int NOT NULL,
  `fecha_prestamo` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion_esperada` date NOT NULL,
  `fecha_devolucion_real` timestamp NULL DEFAULT NULL,
  `motivo` text NOT NULL,
  `observaciones` text,
  `estado` enum('Activo', 'Devuelto', 'Vencido') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_prestamo`),
  KEY `idx_prestamos_archivador` (`id_archivador`),
  KEY `idx_prestamos_area_solicitante` (`id_area_solicitante`),
  CONSTRAINT `prestamos_archivadores_ibfk_1` FOREIGN KEY (`id_archivador`) REFERENCES `archivadores` (`id_archivador`),
  CONSTRAINT `prestamos_archivadores_ibfk_2` FOREIGN KEY (`id_area_solicitante`) REFERENCES `areas` (`id_area`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: auditoria
DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `accion` varchar(255) NOT NULL,
  `tabla_afectada` varchar(100) NOT NULL,
  `id_registro_afectado` int NOT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `detalles` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `accion_detalle` text,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_usuario_fecha` (`id_usuario`, `fecha_hora`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: configuracion_sistema
DROP TABLE IF EXISTS `configuracion_sistema`;
CREATE TABLE `configuracion_sistema` (
  `id_config` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text,
  `descripcion` text,
  `fecha_modificacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabla: refresh_tokens
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id_refresh_token` INT(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` INT(11) NOT NULL,
  `token` TEXT NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` DATETIME NOT NULL,
  `usado` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_uso` DATETIME NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` TEXT NULL DEFAULT NULL,
  `revocado` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_revocacion` DATETIME NULL DEFAULT NULL,
  `token_anterior_id` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id_refresh_token`),
  UNIQUE INDEX `token_hash` (`token_hash`),
  CONSTRAINT `fk_refresh_tokens_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;


-- Tabla: password_reset_tokens
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id_token` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` DATETIME NOT NULL,
  `usado` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_uso` DATETIME NULL DEFAULT NULL,
  `ip_solicitud` VARCHAR(45) NULL DEFAULT NULL,
  `ip_uso` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_password_reset_usuario` (`id_usuario`),
  KEY `idx_password_reset_expiracion` (`fecha_expiracion`),
  KEY `idx_password_reset_usado` (`usado`),
  KEY `idx_password_reset_email` (`email`),
  KEY `idx_password_reset_composite` (`token`, `usado`, `fecha_expiracion`),
  CONSTRAINT `fk_password_reset_usuario` FOREIGN KEY (`id_usuario`) 
    REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla: password_reset_attempts
DROP TABLE IF EXISTS `password_reset_attempts`;
CREATE TABLE `password_reset_attempts` (
  `id_intento` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `fecha_intento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `exito` TINYINT(1) NOT NULL DEFAULT 0,
  `motivo_fallo` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id_intento`),
  KEY `idx_password_attempts_email` (`email`, `fecha_intento`),
  KEY `idx_password_attempts_ip` (`ip_address`, `fecha_intento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;