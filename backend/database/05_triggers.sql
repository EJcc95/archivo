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
      END

CREATE TRIGGER `trg_documentos_after_update` AFTER UPDATE ON `documentos`
 FOR EACH ROW BEGIN
          -- 1. Soft Delete: Se elimina (0 -> 1) -> Restar folios
          IF OLD.eliminado = 0 AND NEW.eliminado = 1 AND OLD.id_archivador IS NOT NULL THEN
              UPDATE archivadores SET total_folios = total_folios - OLD.numero_folios
              WHERE id_archivador = OLD.id_archivador;
          
          -- 2. Restore: Se restaura (1 -> 0) -> Sumar folios
          ELSEIF OLD.eliminado = 1 AND NEW.eliminado = 0 AND NEW.id_archivador IS NOT NULL THEN
              UPDATE archivadores SET total_folios = total_folios + NEW.numero_folios
              WHERE id_archivador = NEW.id_archivador;

          -- 3. Actualización normal (solo si no está eliminado y sigue sin estarlo)
          ELSEIF NEW.eliminado = 0 THEN
              -- A. Cambio de folios en mismo archivador
              IF (OLD.id_archivador <=> NEW.id_archivador) AND (OLD.numero_folios != NEW.numero_folios) AND NEW.id_archivador IS NOT NULL THEN
                  UPDATE archivadores 
                  SET total_folios = total_folios + (NEW.numero_folios - OLD.numero_folios)
                  WHERE id_archivador = NEW.id_archivador;
              END IF;

              -- B. Movimiento de archivador
              IF NOT (OLD.id_archivador <=> NEW.id_archivador) THEN
                  IF OLD.id_archivador IS NOT NULL THEN
                      UPDATE archivadores SET total_folios = total_folios - OLD.numero_folios
                      WHERE id_archivador = OLD.id_archivador;
                  END IF;
                  IF NEW.id_archivador IS NOT NULL THEN
                      UPDATE archivadores SET total_folios = total_folios + NEW.numero_folios
                      WHERE id_archivador = NEW.id_archivador;
                  END IF;
              END IF;
          END IF;
          
          -- Auditoría
          IF OLD.eliminado = 0 AND NEW.eliminado = 1 THEN
              INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro_afectado, accion_detalle)
              VALUES (NEW.id_usuario_eliminacion, 'ELIMINAR', 'documentos', NEW.id_documento, 'Soft delete aplicado');
          END IF;
      END

DELIMITER ;