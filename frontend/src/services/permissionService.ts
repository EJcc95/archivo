import api from '@/api/axios';
import type { PermisosResponse, Permiso } from '@/types';

export const permissionService = {
  getPermissions: async (): Promise<PermisosResponse> => {
    const { data } = await api.get('/roles/permissions/all');

    // Transform flat array to grouped structure
    const permissions: Permiso[] = data.data || data; // Handle if data is wrapped or not

    const permisos_por_categoria = permissions.reduce((acc: Record<string, Permiso[]>, curr) => {
      const parts = curr.nombre_permiso.split('_');
      const category = parts.length > 1 ? parts[0] : 'GENERAL';

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(curr);
      return acc;
    }, {});

    return {
      total: permissions.length,
      permisos_por_categoria
    };
  }
};
