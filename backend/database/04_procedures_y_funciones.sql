-- =====================================================
-- FUNCIONES
-- =====================================================

DELIMITER $$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_obtener_estado_doc`(p_id_estado INT) RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_nombre VARCHAR(50);
    SELECT nombre_estado INTO v_nombre FROM estados_documento WHERE id_estado = p_id_estado;
    RETURN v_nombre;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_verificar_capacidad_archivador`(p_id_archivador INT, p_nuevos_folios INT) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
    DECLARE v_capacidad_max INT;
    DECLARE v_folios_actuales INT;
    
    -- Obtener configuración (default 500)
    SELECT CAST(valor AS UNSIGNED) INTO v_capacidad_max 
    FROM configuracion_sistema 
    WHERE clave = 'capacidad_maxima_archivador';
    
    IF v_capacidad_max IS NULL THEN SET v_capacidad_max = 500; END IF;

    SELECT total_folios INTO v_folios_actuales 
    FROM archivadores 
    WHERE id_archivador = p_id_archivador;
    
    IF (v_folios_actuales + p_nuevos_folios) > v_capacidad_max THEN
        RETURN 0; -- Sin espacio
    ELSE
        RETURN 1; -- Con espacio
    END IF;
END$$
DELIMITER ;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_prestamo`(
    IN p_id_archivador INT,
    IN p_id_area_solicitante INT,
    IN p_fecha_devolucion DATE,
    IN p_motivo TEXT,
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    SELECT estado INTO v_estado_actual FROM archivadores WHERE id_archivador = p_id_archivador FOR UPDATE;
    
    IF v_estado_actual != 'Abierto' AND v_estado_actual != 'Cerrado' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El archivador no está disponible para préstamo.';
    END IF;

    INSERT INTO prestamos_archivadores (
        id_archivador, id_area_solicitante, fecha_devolucion_esperada, motivo, estado
    ) VALUES (
        p_id_archivador, p_id_area_solicitante, p_fecha_devolucion, p_motivo, 'Activo'
    );

    UPDATE archivadores SET estado = 'En Custodia' WHERE id_archivador = p_id_archivador;
    
    INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, accion_detalle)
    VALUES (p_id_usuario, 'PRESTAMO', 'archivadores', p_id_archivador, CONCAT('Archivador prestado a área ID: ', p_id_area_solicitante));

    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_documento`(
    IN p_id_documento INT,
    IN p_id_usuario INT,
    IN p_motivo TEXT
)
BEGIN
    UPDATE documentos 
    SET 
        eliminado = 1,
        fecha_eliminacion = NOW(),
        id_usuario_eliminacion = p_id_usuario,
        observaciones = CONCAT(IFNULL(observaciones,''), ' | Motivo eliminación: ', p_motivo)
    WHERE id_documento = p_id_documento;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_documento`(
    IN p_nombre_doc VARCHAR(100),
    IN p_asunto TEXT,
    IN p_fecha_doc DATE,
    IN p_folios INT,
    IN p_observaciones TEXT,
    IN p_ruta_archivo VARCHAR(255),
    IN p_id_tipo INT,
    IN p_id_area_origen INT,
    IN p_id_area_destino INT,
    IN p_externo VARCHAR(200),
    IN p_id_archivador INT,
    IN p_id_usuario INT,
    OUT p_nuevo_id INT
)
BEGIN
    DECLARE v_tiene_espacio TINYINT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Validar capacidad
    IF p_id_archivador IS NOT NULL THEN
        SET v_tiene_espacio = fn_verificar_capacidad_archivador(p_id_archivador, p_folios);
        IF v_tiene_espacio = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error: El archivador seleccionado excede su capacidad máxima.';
        END IF;
    END IF;

    INSERT INTO documentos (
        nombre_documento, asunto, fecha_documento, numero_folios, observaciones,
        ruta_archivo_digital, id_tipo_documento, id_area_origen, id_area_destino,
        destinatario_externo, id_archivador, id_archivador_original, id_usuario_registro, id_estado
    ) VALUES (
        p_nombre_doc, p_asunto, p_fecha_doc, p_folios, p_observaciones,
        p_ruta_archivo, p_id_tipo, p_id_area_origen, p_id_area_destino,
        p_externo, p_id_archivador, p_id_archivador, p_id_usuario, 
        IF(p_id_archivador IS NULL, 1, 3)
    );
    
    SET p_nuevo_id = LAST_INSERT_ID();

    COMMIT;
END$$
DELIMITER ;
