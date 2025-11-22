import api from '@/api/axios';
import type { Rol } from '@/types/models';

export const roleService = {
  getAll: async () => {
    const { data } = await api.get('/roles');
    return data.data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/roles/${id}`);
    return data.data;
  },
  create: async (rol: Partial<Rol>) => {
    const { data } = await api.post('/roles', rol);
    return data.data;
  },
  update: async (id: number, rol: Partial<Rol>) => {
    const { data } = await api.put(`/roles/${id}`, rol);
    return data.data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data.data;
  },
  getRoleById: async (id: number): Promise<any> => {
    const { data } = await api.get(`/roles/${id}`);
    return data.data;
  },
  assignPermissions: async (id: number, data: { permisos: number[] }) => {
    const { data: response } = await api.post(`/roles/${id}/permissions`, data);
    return response.data;
  },
  createRole: async (rol: Partial<Rol>) => {
    const { data } = await api.post('/roles', rol);
    return data.data;
  },
  updateRole: async (id: number, rol: Partial<Rol>) => {
    const { data } = await api.put(`/roles/${id}`, rol);
    return data.data;
  },
  deleteRole: async (id: number) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data.data;
  },
  getUsersByRole: async (id: number) => {
    const { data } = await api.get(`/roles/${id}/users`);
    return data.data;
  }
};
