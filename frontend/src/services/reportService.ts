import api from '@/api/axios';

export interface DashboardStats {
  total_documentos: number;
  total_usuarios: number;
  total_areas: number;
  total_archivadores: number;
  documentsByState?: Array<{ nombre: string; value: number }>;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export const reportService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/reports/dashboard');
    // Map camelCase backend response to snake_case frontend interface
    return {
      total_documentos: data.data.totalDocumentos,
      total_usuarios: data.data.totalUsuarios,
      total_areas: data.data.totalAreas,
      total_archivadores: data.data.totalArchivadores,
      documentsByState: data.data.documentsByState
    };
  },

  getDocumentosByArea: async (): Promise<ChartData[]> => {
    const { data } = await api.get('/reports/by-area');
    return data.data.map((item: any) => ({
      name: item.name,
      value: parseInt(item.value),
      color: item.color
    }));
  },

  getDocumentosByTipo: async (): Promise<ChartData[]> => {
    const { data } = await api.get('/reports/by-tipo');
    return data.data.map((item: any) => ({
      name: item.name,
      value: parseInt(item.value)
    }));
  },

  getDocumentosByEstado: async (): Promise<ChartData[]> => {
    const { data } = await api.get('/reports/by-estado');
    return data.data.map((item: any) => ({
      name: item.name,
      value: parseInt(item.value)
    }));
  },

  getUserActivity: async (params?: { limit?: number }): Promise<any[]> => {
    const { data } = await api.get('/reports/user-activity', { params });
    return data.data;
  }
};
