import api from '@/api/axios';
import type { Archivador } from '@/types/models';

export const archivadorService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/archivadores', { params });
    return data.data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/archivadores/${id}`);
    return data.data;
  },
  create: async (archivador: Partial<Archivador>) => {
    const { data } = await api.post('/archivadores', archivador);
    return data.data;
  },
  update: async (id: number, archivador: Partial<Archivador>) => {
    const { data } = await api.put(`/archivadores/${id}`, archivador);
    return data.data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/archivadores/${id}`);
    return data.data;
  },
  restore: async (id: number) => {
    const { data } = await api.post(`/archivadores/${id}/restore`);
    return data.data;
  }
};
