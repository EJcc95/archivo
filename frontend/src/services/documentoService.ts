import api from '@/api/axios';
import type { Documento } from '@/types/models';
import { getSecureItem } from '@/utils/encryption';

export const documentoService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/documentos', { params });
    return data.data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/documentos/${id}`);
    return data.data;
  },
  create: async (formData: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    const { data } = await api.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return data.data;
  },
  update: async (id: number, documento: Partial<Documento> | FormData, onUploadProgress?: (progressEvent: any) => void) => {
    const isFormData = documento instanceof FormData;
    const config: any = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    if (isFormData && onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }

    const { data } = await api.put(`/documentos/${id}`, documento, config);
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
  download: async (id: number, onDownloadProgress?: (progressEvent: any) => void) => {
    const response = await api.get(`/documentos/${id}/download`, {
      responseType: 'blob',
      onDownloadProgress
    });
    return response.data;
  },
  getViewUrl: (id: number) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // Get decrypted token from secure storage
    const token = getSecureItem<string>('token');
    if (!token) {
      console.warn('No token found for PDF viewing');
      return `${baseURL}/documentos/${id}/view`;
    }
    return `${baseURL}/documentos/${id}/view?token=${encodeURIComponent(token)}`;
  },
  view: async (id: number) => {
    // Retorna la URL para visualizar el documento
    const response = await api.get(`/documentos/${id}/view`, { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  }
};
