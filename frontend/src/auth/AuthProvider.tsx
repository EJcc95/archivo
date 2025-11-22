import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState } from '@/types/auth';
import { authService } from '@/services/authService';
import { setSecureItem, getSecureItem, clearSecureStorage } from '@/utils/encryption';

interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decodifica Base64 (utilidad para desencriptar datos iniciales)
 */
function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      try {
        // Intenta obtener datos cifrados primero
        const user = getSecureItem<any>('user');
        const token = getSecureItem<string>('token');
        
        // Si existen, usar los datos cifrados
        if (token && user) {
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Si no hay datos cifrados, intenta compatibilidad con localStorage antiguo
          const legacyToken = localStorage.getItem('token');
          const legacyUser = localStorage.getItem('user');
          
          if (legacyToken && legacyUser && !legacyToken.includes('|')) {
            // Datos sin cifrar detectados - migrar a cifrado
            try {
              const user = JSON.parse(legacyUser);
              setSecureItem('token', legacyToken);
              setSecureItem('refreshToken', localStorage.getItem('refreshToken') || '');
              setSecureItem('user', user);
              
              // Limpiar datos antiguos sin cifrar
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              setState({
                user,
                token: legacyToken,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (e) {
              clearSecureStorage();
              setState(prev => ({ ...prev, isLoading: false }));
            }
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearSecureStorage();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await authService.login(credentials);
      
      // Guardar de forma cifrada
      setSecureItem('token', response.accessToken);
      setSecureItem('refreshToken', response.refreshToken);
      setSecureItem('user', response.user);
      
      setState({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearSecureStorage();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Opcional: Llamar al backend para invalidar token
    authService.logout().catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
