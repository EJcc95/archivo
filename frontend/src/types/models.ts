export interface Area {
  id_area: number;
  id_organizacion?: number;
  nombre_area: string;
  siglas?: string;
  estado: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string;
  permisos_count?: number;
  usuarios_count?: number;
}

export interface Usuario {
  id_usuario: number;
  id_organizacion: number;
  nombre_usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  id_rol: number;
  id_area?: number;
  estado: boolean;
  fecha_creacion?: string;
  Rol?: Rol;
  Area?: Area;
}

export interface Archivador {
  id_archivador: number;
  nombre_archivador: string;
  descripcion: string;
  id_area_propietaria: number;
  id_tipo_documento_contenido: number;
  total_folios: number;
  ubicacion_fisica?: string;
  fecha_creacion?: string;
  id_usuario_creacion?: number;
  fecha_modificacion?: string;
  id_usuario_modificacion?: number;
  estado: 'Abierto' | 'Cerrado' | 'En Custodia';
  eliminado: boolean;
  fecha_eliminacion?: string;
  id_usuario_eliminacion?: number;
  areaPropietaria?: Area;
  tipoDocumentoContenido?: TipoDocumento;
}

export interface TipoDocumento {
  id_tipo_documento: number;
  nombre_tipo: string;
  descripcion?: string;
  color?: string;
}

export interface Documento {
  id_documento: number;
  nombre_documento: string;
  asunto: string;
  fecha_documento: string;
  numero_folios: number;
  observaciones?: string;
  ruta_archivo_digital?: string;
  id_tipo_documento: number;
  id_area_origen: number;
  id_area_destino?: number;
  destinatario_externo?: string;
  id_archivador?: number;
  id_archivador_original?: number;
  id_usuario_registro: number;
  fecha_registro_sistema?: string;
  id_usuario_modificacion?: number;
  fecha_modificacion?: string;
  eliminado: boolean;
  fecha_eliminacion?: string;
  id_usuario_eliminacion?: number;
  id_estado: number;
  fecha_ultima_consulta?: string;
  numero_consultas: number;
  // Relations
  tipoDocumento?: TipoDocumento;
  areaOrigen?: Area;
  areaDestino?: Area;
  archivador?: Archivador;
  estado?: EstadoDocumento;
}

export interface EstadoDocumento {
  id_estado: number;
  nombre_estado: string;
  descripcion?: string;
  activo: boolean;
}
