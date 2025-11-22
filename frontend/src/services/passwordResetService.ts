import api from '@/api/axios';

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const validateResetToken = async (token: string): Promise<boolean> => {
  // Backend doesn't have a specific validation endpoint yet, 
  // so we assume it's valid if it exists. 
  // Real validation happens on reset attempt.
  return !!token;
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, newPassword });
};
