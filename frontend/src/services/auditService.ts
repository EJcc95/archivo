import api from '@/api/axios';

export interface AuditLog {
  id_auditoria: number;
  id_usuario: number;
  accion: string;
  tabla_afectada?: string;
  id_registro_afectado?: number;
  fecha_hora: string;
  detalles?: string;
  ip_address?: string;
  user_agent?: string;
  Usuario?: {
    nombre_usuario: string;
    nombres: string;
    apellidos: string;
    email: string;
  };
}

export interface AuditLogsResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  logs: AuditLog[];
}

export const auditService = {
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    id_usuario?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<AuditLogsResponse> => {
    const { data } = await api.get('/audit/logs', { params });
    return data.data;
  },
};
