import api from '@/api/axios';
import type { PermisosResponse } from '@/types';

export const permissionService = {
  getPermissions: async (): Promise<PermisosResponse> => {
    const { data } = await api.get('/permissions');
    return data.data;
  }
};
