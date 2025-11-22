import api from '@/api/axios';

export const auditService = {
  getLogs: async (params?: any) => {
    const { data } = await api.get('/audit', { params });
    return data.data;
  }
};
