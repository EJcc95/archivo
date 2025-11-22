import axios from 'axios';
import { getSecureItem, setSecureItem, clearSecureStorage } from '@/utils/encryption';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permitir envío de cookies
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener token cifrado
    const token = getSecureItem<string>('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (ej. token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado) y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Obtener refresh token cifrado
        const refreshToken = getSecureItem<string>('refreshToken');

        if (refreshToken) {
          // Usamos una instancia nueva de axios para evitar el interceptor y ciclos infinitos
          const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken }, {
            withCredentials: true,
          });

          const { accessToken, refreshToken: newRefreshToken } = data.data;

          // Guardar tokens cifrados
          setSecureItem('token', accessToken);
          if (newRefreshToken) {
            setSecureItem('refreshToken', newRefreshToken);
          }

          // Actualizar el header de la petición original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Actualizar el header por defecto para futuras peticiones
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, cerramos sesión
        clearSecureStorage();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }

      // Si no hay refresh token o falló algo más
      clearSecureStorage();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
