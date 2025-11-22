import api from '@/api/axios';

export const reportService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/reports/dashboard');
    return data.data;
  },
  getByArea: async () => {
    const { data } = await api.get('/reports/by-area');
    return data.data;
  },
  getByTipo: async () => {
    const { data } = await api.get('/reports/by-tipo');
    return data.data;
  },
  getByEstado: async () => {
    const { data } = await api.get('/reports/by-estado');
    return data.data;
  },
  getUserActivity: async (params?: { limit?: number }) => {
    const { data } = await api.get('/audit/activity', { params });
    return data.data;
  }
};
