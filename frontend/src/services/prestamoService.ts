import api from '@/api/axios';

export interface Prestamo {
  id_prestamo: number;
  id_archivador: number;
  id_area_solicitante: number;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real?: string;
  motivo: string;
  observaciones?: string;
  estado: 'Activo' | 'Devuelto' | 'Vencido';
  Archivador?: {
    nombre_archivador: string;
    descripcion?: string;
  };
  areaSolicitante?: {
    nombre_area: string;
  };
}

export interface CreatePrestamoRequest {
  id_archivador: number;
  id_area_solicitante: number;
  fecha_devolucion_esperada: string;
  motivo: string;
  observaciones?: string;
}

export interface ReturnPrestamoRequest {
  observaciones?: string;
}

export interface PrestamoFormData {
  fecha_devolucion_esperada: string;
  motivo: string;
  observaciones?: string;
}

export const prestamoService = {
  getAll: async (params?: { estado?: string }): Promise<Prestamo[]> => {
    const { data } = await api.get('/prestamos', { params });
    return data.data;
  },

  getById: async (id: number): Promise<Prestamo> => {
    const { data } = await api.get(`/prestamos/${id}`);
    return data.data;
  },

  create: async (data: CreatePrestamoRequest): Promise<Prestamo> => {
    const { data: response } = await api.post('/prestamos', data);
    return response.data;
  },

  returnPrestamo: async (id: number, data: ReturnPrestamoRequest): Promise<Prestamo> => {
    const { data: response } = await api.post(`/prestamos/${id}/return`, data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<PrestamoFormData>): Promise<Prestamo> => {
    const { data: response } = await api.put(`/prestamos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/prestamos/${id}`);
  }
};
