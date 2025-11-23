import api from '@/api/axios';

export interface Config {
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const configService = {
  getAll: async (): Promise<Config[]> => {
    const { data } = await api.get('/config');
    return data.data;
  },

  getByKey: async (key: string): Promise<Config> => {
    const { data } = await api.get(`/config/${key}`);
    return data.data;
  },

  set: async (key: string, value: string, description?: string): Promise<Config> => {
    const { data } = await api.post('/config', { key, value, description });
    return data.data;
  },

  delete: async (key: string): Promise<void> => {
    await api.delete(`/config/${key}`);
  }
};
