import api from '@/api/axios';

export const configService = {
  getAll: async () => {
    const { data } = await api.get('/config');
    return data.data;
  },
  getByKey: async (key: string) => {
    const { data } = await api.get(`/config/${key}`);
    return data.data;
  },
  set: async (key: string, value: string, description?: string) => {
    const { data } = await api.post('/config', { key, value, description });
    return data.data;
  },
  delete: async (key: string) => {
    const { data } = await api.delete(`/config/${key}`);
    return data.data;
  }
};
