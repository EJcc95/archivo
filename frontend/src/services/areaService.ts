import api from '@/api/axios';
import type { Area } from '@/types/models';

export const areaService = {
  getAll: async () => {
    const { data } = await api.get('/areas');
    return data.data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/areas/${id}`);
    return data.data;
  },
  create: async (area: Partial<Area>) => {
    const { data } = await api.post('/areas', area);
    return data.data;
  },
  update: async (id: number, area: Partial<Area>) => {
    const { data } = await api.put(`/areas/${id}`, area);
    return data.data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/areas/${id}`);
    return data.data;
  }
};
