import api from '@/api/axios';
import type { Usuario } from '@/types/models';

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data.data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  },
  create: async (user: Partial<Usuario>) => {
    const { data } = await api.post('/users', user);
    return data.data;
  },
  update: async (id: number, user: Partial<Usuario>) => {
    const { data } = await api.put(`/users/${id}`, user);
    return data.data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/users/${id}`);
    return data.data;
  }
};
