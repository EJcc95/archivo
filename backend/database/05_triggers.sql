-- =====================================================
-- SISTEMA DE TRIGGERS - GESTIÓN DOCUMENTARIA
DELIMITER $$
CREATE TRIGGER `trg_documentos_after_insert` AFTER INSERT ON `documentos`
 FOR EACH ROW BEGIN
    IF NEW.id_archivador IS NOT NULL AND NEW.eliminado = 0 THEN
        UPDATE archivadores 
        SET total_folios = total_folios + NEW.numero_folios
        WHERE id_archivador = NEW.id_archivador;
    END IF;
    
    INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, accion_detalle)
    VALUES (NEW.id_usuario_registro, 'CREAR', 'documentos', NEW.id_documento, CONCAT('Documento creado: ', NEW.nombre_documento));
END$$

CREATE TRIGGER `trg_documentos_after_update` AFTER UPDATE ON `documentos`
 FOR EACH ROW BEGIN
    -- A. Cambio de folios en mismo archivador
    IF OLD.id_archivador <=> NEW.id_archivador AND OLD.numero_folios != NEW.numero_folios AND NEW.id_archivador IS NOT NULL THEN
        UPDATE archivadores 
        SET total_folios = total_folios + (NEW.numero_folios - OLD.numero_folios)
        WHERE id_archivador = NEW.id_archivador;
    END IF;

    -- B. Movimiento de archivador
    IF OLD.id_archivador <=> NEW.id_archivador = 0 THEN
        IF OLD.id_archivador IS NOT NULL THEN
            UPDATE archivadores SET total_folios = total_folios - OLD.numero_folios
            WHERE id_archivador = OLD.id_archivador;
        END IF;
        IF NEW.id_archivador IS NOT NULL THEN
            UPDATE archivadores SET total_folios = total_folios + NEW.numero_folios
            WHERE id_archivador = NEW.id_archivador;
        END IF;
    END IF;
    
    -- C. Auditoría Soft Delete
    IF OLD.eliminado = 0 AND NEW.eliminado = 1 THEN
        INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, accion_detalle)
        VALUES (NEW.id_usuario_eliminacion, 'ELIMINAR', 'documentos', NEW.id_documento, 'Soft delete aplicado');
    END IF;
END$$
DELIMITER ;