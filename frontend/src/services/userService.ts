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
  },
  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data.data;
  },
  updateProfile: async (profile: any) => {
    const { data } = await api.put('/users/profile', profile);
    return data.data;
  },
  changePassword: async (passwords: any) => {
    const { data } = await api.put('/users/change-password', passwords);
    return data.data;
  },
  resetPassword: async (id: number) => {
    const { data } = await api.post(`/users/${id}/reset-password`);
    return data;
  }
};
