export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string; // Código del rol (ej: 'ADMIN', 'USER', etc.)
  permisos?: string[]; // Lista de códigos de permisos del usuario
  activo?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
