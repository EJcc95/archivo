import api from '@/api/axios';

export interface Config {
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigResponse {
  success: boolean;
  data: Config;
  message?: string;
}

export interface ConfigListResponse {
  success: boolean;
  data: Config[];
}

export const configService = {
  // Obtener todas las configuraciones
  getAll: async (): Promise<Config[]> => {
    const { data } = await api.get<ConfigListResponse>('/config');
    return data.data;
  },

  // Obtener una configuración por clave
  getByKey: async (key: string): Promise<Config> => {
    const { data } = await api.get<ConfigResponse>(`/config/${key}`);
    return data.data;
  },

  // Crear o actualizar configuración (POST - upsert)
  set: async (key: string, value: string, description?: string): Promise<Config> => {
    const { data } = await api.post<ConfigResponse>('/config', { key, value, description });
    return data.data;
  },

  // Actualizar configuración existente (PUT)
  update: async (key: string, value: string, description?: string): Promise<Config> => {
    const { data } = await api.put<ConfigResponse>(`/config/${key}`, { value, description });
    return data.data;
  },

  // Eliminar configuración
  delete: async (key: string): Promise<void> => {
    await api.delete(`/config/${key}`);
  }
};

