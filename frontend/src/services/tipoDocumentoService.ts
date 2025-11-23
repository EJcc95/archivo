import api from '@/api/axios';

export const tipoDocumentoService = {
  getAll: async () => {
    const { data } = await api.get('/tipos-documento');
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get(`/tipos-documento/${id}`);
    return data.data;
  },

  create: async (data: any) => {
    const { data: response } = await api.post('/tipos-documento', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const { data: response } = await api.put(`/tipos-documento/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete(`/tipos-documento/${id}`);
    return data;
  }
};
