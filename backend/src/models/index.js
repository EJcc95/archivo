const { sequelize } = require('../config/database');

// Importar modelos
const Organizacion = require('./Organizacion');
const Area = require('./Area');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const RolPermiso = require('./RolPermiso');
const Usuario = require('./Usuario');
const RefreshToken = require('./RefreshToken');
const TipoDocumento = require('./TipoDocumento');
const EstadoDocumento = require('./EstadoDocumento');
const Archivador = require('./Archivador');
const Documento = require('./Documento');
const PrestamoArchivador = require('./PrestamoArchivador');
const Auditoria = require('./Auditoria');
const ConfiguracionSistema = require('./ConfiguracionSistema');
const PasswordResetToken = require('./PasswordResetToken');
const PasswordResetAttempt = require('./PasswordResetAttempt');

// Definir relaciones

// 1. Organización y Áreas
Organizacion.hasMany(Area, { foreignKey: 'id_organizacion' });
Area.belongsTo(Organizacion, { foreignKey: 'id_organizacion' });

// 2. Roles y Permisos
Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'id_rol', otherKey: 'id_permiso' });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'id_permiso', otherKey: 'id_rol' });

// 3. Usuarios
Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

Area.hasMany(Usuario, { foreignKey: 'id_area' });
Usuario.belongsTo(Area, { foreignKey: 'id_area' });

Organizacion.hasMany(Usuario, { foreignKey: 'id_organizacion' });
Usuario.belongsTo(Organizacion, { foreignKey: 'id_organizacion' });

// 4. Archivadores
Area.hasMany(Archivador, { foreignKey: 'id_area_propietaria' });
Archivador.belongsTo(Area, { foreignKey: 'id_area_propietaria', as: 'areaPropietaria' });

TipoDocumento.hasMany(Archivador, { foreignKey: 'id_tipo_documento_contenido' });
Archivador.belongsTo(TipoDocumento, { foreignKey: 'id_tipo_documento_contenido', as: 'tipoDocumentoContenido' });

Usuario.hasMany(Archivador, { foreignKey: 'id_usuario_creacion' });
Archivador.belongsTo(Usuario, { foreignKey: 'id_usuario_creacion', as: 'usuarioCreacion' });

Usuario.hasMany(Archivador, { foreignKey: 'id_usuario_modificacion' });
Archivador.belongsTo(Usuario, { foreignKey: 'id_usuario_modificacion', as: 'usuarioModificacion' });

// 5. Documentos
TipoDocumento.hasMany(Documento, { foreignKey: 'id_tipo_documento' });
Documento.belongsTo(TipoDocumento, { foreignKey: 'id_tipo_documento' });

Area.hasMany(Documento, { foreignKey: 'id_area_origen' });
Documento.belongsTo(Area, { foreignKey: 'id_area_origen', as: 'areaOrigen' });

Area.hasMany(Documento, { foreignKey: 'id_area_destino' });
Documento.belongsTo(Area, { foreignKey: 'id_area_destino', as: 'areaDestino' });

Archivador.hasMany(Documento, { foreignKey: 'id_archivador' });
Documento.belongsTo(Archivador, { foreignKey: 'id_archivador' });

Usuario.hasMany(Documento, { foreignKey: 'id_usuario_registro' });
Documento.belongsTo(Usuario, { foreignKey: 'id_usuario_registro', as: 'usuarioRegistro' });

Usuario.hasMany(Documento, { foreignKey: 'id_usuario_modificacion' });
Documento.belongsTo(Usuario, { foreignKey: 'id_usuario_modificacion', as: 'usuarioModificacion' });

Usuario.hasMany(Documento, { foreignKey: 'id_usuario_eliminacion' });
Documento.belongsTo(Usuario, { foreignKey: 'id_usuario_eliminacion', as: 'usuarioEliminacion' });

EstadoDocumento.hasMany(Documento, { foreignKey: 'id_estado' });
Documento.belongsTo(EstadoDocumento, { foreignKey: 'id_estado' });

// 6. Préstamos
Archivador.hasMany(PrestamoArchivador, { foreignKey: 'id_archivador' });
PrestamoArchivador.belongsTo(Archivador, { foreignKey: 'id_archivador' });

Usuario.hasMany(PrestamoArchivador, { foreignKey: 'id_usuario_solicitante' });
PrestamoArchivador.belongsTo(Usuario, { foreignKey: 'id_usuario_solicitante', as: 'usuarioSolicitante' });

// 7. Auditoría
Usuario.hasMany(Auditoria, { foreignKey: 'id_usuario' });
Auditoria.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// 8. Tokens
Usuario.hasMany(RefreshToken, { foreignKey: 'id_usuario' });
RefreshToken.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Usuario.hasMany(PasswordResetToken, { foreignKey: 'id_usuario' });
PasswordResetToken.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Exportar modelos y conexión
module.exports = {
  sequelize,
  Organizacion,
  Area,
  Rol,
  Permiso,
  RolPermiso,
  Usuario,
  RefreshToken,
  TipoDocumento,
  EstadoDocumento,
  Archivador,
  Documento,
  PrestamoArchivador,
  Auditoria,
  ConfiguracionSistema,
  PasswordResetToken,
  PasswordResetAttempt
};
