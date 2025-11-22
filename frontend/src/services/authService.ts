import api from '@/api/axios';
import type { LoginResponse } from '@/types/auth';

export const authService = {
  async login(credentials: any): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', {
      email: credentials.identifier,
      password: credentials.password
    });
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(token: string): Promise<{ accessToken: string, refreshToken: string }> {
    const { data } = await api.post('/auth/refresh-token', { token });
    return data.data;
  }
};
