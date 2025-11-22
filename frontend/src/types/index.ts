export * from './auth';
export * from './models';

import type { Rol, Usuario } from './models';

export interface Permiso {
  id_permiso: number;
  nombre_permiso: string;
  descripcion?: string;
  codigo: string;
}

export interface PermisosResponse {
  total: number;
  permisos_por_categoria: Record<string, Permiso[]>;
}

export interface RolConPermisos extends Rol {
  permisos: Permiso[];
}

export interface RolConUsuarios {
  total_usuarios: number;
  usuarios: Usuario[];
}

export interface CreateRolRequest {
  nombre_rol: string;
  descripcion?: string;
}

export interface UpdateRolRequest {
  nombre_rol?: string;
  descripcion?: string;
}
