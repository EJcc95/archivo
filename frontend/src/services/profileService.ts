import api from '@/api/axios';
import type { Usuario } from '@/types';

export interface ProfileData {
  nombres: string;
  apellidos: string;
  email: string;
  nombre_usuario: string;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileService = {
  getProfile: async (): Promise<Usuario> => {
    const { data } = await api.get('/users/profile');
    return data.data;
  },

  updateProfile: async (data: ProfileData): Promise<Usuario> => {
    const { data: response } = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: Omit<PasswordChangeData, 'confirmPassword'>): Promise<void> => {
    await api.put('/users/change-password', data);
  }
};
