import api from '@/api/axios';
import type { Documento } from '@/types/models';

export const documentoService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/documentos', { params });
    return data.data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/documentos/${id}`);
    return data.data;
  },
  create: async (formData: FormData) => {
    const { data } = await api.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
  },
  update: async (id: number, documento: Partial<Documento>) => {
    const { data } = await api.put(`/documentos/${id}`, documento);
    return data.data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/documentos/${id}`);
    return data.data;
  },
  restore: async (id: number) => {
    const { data } = await api.put(`/documentos/${id}/restore`);
    return data.data;
  },
  view: async (id: number) => {
    // Retorna la URL para visualizar el documento
    const response = await api.get(`/documentos/${id}/view`, { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  }
};
