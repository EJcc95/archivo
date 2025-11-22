export interface Area {
  id_area: number;
  nombre_area: string;
  codigo_area: string;
  descripcion?: string;
  estado: boolean;
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
  codigo_archivador: string;
  ubicacion_fisica?: string;
  capacidad_maxima: number;
  cantidad_actual: number;
  anio: number;
  estado: boolean;
  eliminado: boolean;
  id_area_propietaria: number;
  AreaPropietaria?: Area;
}

export interface Documento {
  id_documento: number;
  nombre_documento: string;
  codigo_documento: string;
  asunto: string;
  fecha_documento: string;
  fecha_recepcion: string;
  numero_folios: number;
  observaciones?: string;
  archivo_url?: string;
  archivo_hash?: string;
  eliminado: boolean;
  id_tipo_documento: number;
  id_archivador: number;
  id_area_origen: number;
  id_estado: number;
}
