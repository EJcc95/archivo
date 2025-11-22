/**
 * Login Page
 * Página de inicio de sesión con diseño TailAdmin split-screen
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuth } from '@/auth';
import Button from '@/components/ui/Button';
import logoAEMWhite from '@/assets/logo-aem-white.png';
import logoAEM from '@/assets/logo-aem.png';

interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ identifier, password });
      // El AuthProvider maneja la navegación automáticamente
      // No establecemos isLoading = false aquí porque el componente se desmontará
    } catch (err: unknown) {

      let errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';

      if (err && typeof err === 'object' && 'message' in err) {
        const apiError = err as ApiError;

        // Mensajes específicos según el tipo de error
        if (apiError.status === 400) {
          errorMessage = apiError.message || 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (apiError.status === 401) {
          errorMessage = 'Email o contraseña incorrectos.';
        } else if (apiError.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          errorMessage = apiError.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F5]">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row">

        {/* Panel Izquierdo - Formulario */}
        <div className="flex flex-col flex-1 justify-center w-full lg:w-1/2 p-4 sm:p-8 lg:p-16">
          <div className="relative w-full max-w-lg mx-auto rounded-xl sm:rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_20px_40px_rgba(3,45,255,0.1)] sm:shadow-[0_25px_55px_rgba(3,45,255,0.12)] p-5 sm:p-8 lg:p-10">
            <div className="absolute -top-8 sm:-top-12 right-4 sm:right-6 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-[#032DFF]/10 blur-3xl pointer-events-none" />
            
            {/* Logo */}
            <div className="mb-5 sm:mb-6 flex justify-start">
              <img
                src={logoAEM}
                alt="AEM Logo"
                className="h-20 sm:h-28 lg:h-32 object-contain"
              />
            </div>

            {/* Header */}
            <div className="mb-4 sm:mb-5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1.5 sm:mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                ¡Ingresa tu usuario y contraseña para continuar!
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-5 sm:space-y-6 mt-5 sm:mt-6">
                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3 shadow-sm">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm text-red-800">{error}</span>
                  </div>
                )}

                <div className="space-y-4 sm:space-y-5">
                  {/* Email/Usuario */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="identifier" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="info@gmail.com"
                      autoComplete="username"
                      required
                      className="h-10 sm:h-11 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-colors shadow-inner"
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        autoComplete="current-password"
                        required
                        className="h-10 sm:h-11 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-colors shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-10"
                      >
                        {showPassword ? (
                          <IconEye size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                        ) : (
                          <IconEyeOff size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-0">
                  <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-blue-300 text-[#032DFF] focus:ring-[#032DFF] focus:ring-offset-0"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">
                      Mantener sesión
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-[#0849FF] hover:text-[#0849FF] transition font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-[#032DFF] hover:bg-[#022FCC] focus:ring-[#032DFF]/30 shadow-lg shadow-[#032DFF]/20 h-10! sm:h-11! text-sm! sm:text-base!"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                    Implementado para la
                    <br />
                    <span className="font-semibold text-gray-800">Municipalidad Distrital de Nuevo Imperial</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-gray-500 pt-2">
                    <svg 
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Versión 1.0 • © {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Panel Derecho - Decorativo */}
        <div className="hidden lg:flex items-center justify-center w-1/2 bg-[#0A36CC] relative overflow-hidden">
          {/* Archivo Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: '#0A36CC',
                backgroundImage: `
        linear-gradient(135deg, rgba(255,255,255,0.08) 50%, transparent 50%),
        linear-gradient(45deg, rgba(10,54,204,0.4) 35%, transparent 35%),
        radial-gradient(circle at 20px 20px, rgba(255,255,255,0.18) 2px, transparent 0),
        radial-gradient(circle at 50px 45px, rgba(255,255,255,0.12) 1.5px, transparent 0)
      `,
                backgroundSize: '140px 140px, 140px 140px, 90px 90px, 90px 90px',
                mixBlendMode: 'soft-light',
                boxShadow: 'inset 0 0 140px rgba(0, 20, 90, 0.35)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
                backgroundSize: '100px 60px',
                opacity: 0.7,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-xl  px-2 text-center h-full">
            <img
              src={logoAEMWhite}
              alt="AEM Logo"
              className="h-40 mb-4 object-contain"
            />
            <p className="text-white font-Quicksand font-light leading-relaxed">
              "Plataforma institucional para la gestión, control y preservación de archivos documentarios municipales"
            </p>
            <div className="mt-2 pt-2 border-t border-white/50 w-full">
              <p className="text-xs text-white font-Quicksand font-light">
                Versión 1.0 • © {new Date().getFullYear()} Archivo Electrónico Municipal - AEM
              </p>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-[#3f37c9]/20 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-[#5e54d6]/20 blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
