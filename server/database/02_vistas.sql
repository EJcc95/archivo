-- Vista: v_documentos_detalle
DROP VIEW IF EXISTS `v_documentos_detalle`;
CREATE VIEW `v_documentos_detalle` AS
SELECT d.id_documento,
  d.nombre_documento,
  d.asunto,
  d.fecha_documento,
  d.numero_folios,
  d.eliminado,
  -- Tipo de documento
  d.id_tipo_documento,
  td.nombre_tipo AS tipo_documento,
  -- Área origen
  d.id_area_origen,
  ao.nombre_area AS area_origen,
  ao.siglas AS siglas_area_origen,
  -- Área destino
  d.id_area_destino,
  ad.nombre_area AS area_destino,
  ad.siglas AS siglas_area_destino,
  -- Destinatario externo
  d.destinatario_externo,
  -- Archivador
  d.id_archivador,
  a.nombre_archivador,
  a.descripcion AS descripcion_archivador,
  a.ubicacion_fisica,
  a.estado AS estado_archivador,
  -- Usuario registro
  d.id_usuario_registro,
  CONCAT(u.nombres, ' ', u.apellidos) AS usuario_que_registro,
  u.email AS email_usuario_registro,
  -- Usuario modificacion (NUEVO)
  d.id_usuario_modificacion,
  CONCAT(um.nombres, ' ', um.apellidos) AS usuario_que_modifico,
  d.fecha_modificacion,
  -- Fechas y metadata
  d.fecha_registro_sistema,
  d.observaciones,
  d.ruta_archivo_digital,
  d.id_estado,
  CASE
    WHEN d.ruta_archivo_digital IS NOT NULL THEN 'Digital'
    ELSE 'Físico'
  END AS tipo_almacenamiento
FROM documentos d
  INNER JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo_documento
  INNER JOIN areas ao ON d.id_area_origen = ao.id_area
  LEFT JOIN areas ad ON d.id_area_destino = ad.id_area
  INNER JOIN archivadores a ON d.id_archivador = a.id_archivador
  INNER JOIN usuarios u ON d.id_usuario_registro = u.id_usuario
  LEFT JOIN usuarios um ON d.id_usuario_modificacion = um.id_usuario
WHERE d.eliminado = 0;

-- Vista: v_documentos_detalle_completa
DROP VIEW IF EXISTS `v_documentos_detalle_completa`;
CREATE VIEW `v_documentos_detalle_completa` AS
SELECT d.id_documento,
  d.nombre_documento,
  d.asunto,
  d.fecha_documento,
  d.numero_folios,
  d.eliminado,
  d.fecha_eliminacion,
  d.id_usuario_eliminacion,
  CONCAT(ue.nombres, ' ', ue.apellidos) AS usuario_que_elimino,
  -- Tipo de documento
  d.id_tipo_documento,
  td.nombre_tipo AS tipo_documento,
  -- Área origen
  d.id_area_origen,
  ao.nombre_area AS area_origen,
  ao.siglas AS siglas_area_origen,
  -- Área destino
  d.id_area_destino,
  ad.nombre_area AS area_destino,
  ad.siglas AS siglas_area_destino,
  -- Destinatario externo
  d.destinatario_externo,
  -- Archivador
  d.id_archivador,
  a.nombre_archivador,
  a.descripcion AS descripcion_archivador,
  a.ubicacion_fisica,
  a.estado AS estado_archivador,
  a.eliminado AS archivador_eliminado,
  -- Usuario registro
  d.id_usuario_registro,
  CONCAT(u.nombres, ' ', u.apellidos) AS usuario_que_registro,
  u.email AS email_usuario_registro,
  -- Usuario modificacion (NUEVO)
  d.id_usuario_modificacion,
  CONCAT(um.nombres, ' ', um.apellidos) AS usuario_que_modifico,
  d.fecha_modificacion,
  -- Fechas y metadata
  d.fecha_registro_sistema,
  d.observaciones,
  d.ruta_archivo_digital,
  d.id_estado,
  CASE
    WHEN d.ruta_archivo_digital IS NOT NULL THEN 'Digital'
    ELSE 'Físico'
  END AS tipo_almacenamiento,
  CASE
    WHEN d.eliminado = TRUE THEN 'ELIMINADO'
    WHEN d.id_archivador IS NULL THEN 'HUERFANO'
    WHEN a.eliminado = TRUE THEN 'ARCHIVADOR_ELIMINADO'
    ELSE 'NORMAL'
  END AS estado_referencias
FROM documentos d
  INNER JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo_documento
  INNER JOIN areas ao ON d.id_area_origen = ao.id_area
  LEFT JOIN areas ad ON d.id_area_destino = ad.id_area
  LEFT JOIN archivadores a ON d.id_archivador = a.id_archivador
  INNER JOIN usuarios u ON d.id_usuario_registro = u.id_usuario
  LEFT JOIN usuarios ue ON d.id_usuario_eliminacion = ue.id_usuario
  LEFT JOIN usuarios um ON d.id_usuario_modificacion = um.id_usuario;

-- (Las otras vistas como v_documentos_huerfanos, v_documentos_referencias_rotas y v_archivadores_eliminados 
-- del archivo original 02_vistas.sql se mantienen iguales, puedes incluirlas aquí si lo deseas)