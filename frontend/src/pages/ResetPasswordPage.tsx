/**
 * Reset Password Page
 * Página para restablecer contraseña con token
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconEye, IconEyeOff, IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react';
import Button from '@/components/ui/Button';
import { validateResetToken, resetPassword } from '@/services/passwordResetService';
import logoAEMWhite from '@/assets/logo-aem-white.png';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Validar requisitos de contraseña
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[@$!%*?&]/.test(newPassword)
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  // Validar token al cargar
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Token no proporcionado');
        setIsValidatingToken(false);
        return;
      }

      try {
        const response = await validateResetToken(token);
        setTokenValid(response.valid);
        setUserEmail(response.email);
      } catch (err: unknown) {
        let errorMessage = 'Token inválido o expirado';
        
        if (err && typeof err === 'object') {
          if ('response' in err && err.response && typeof err.response === 'object' && 
              'data' in err.response && err.response.data && typeof err.response.data === 'object' &&
              'message' in err.response.data) {
            errorMessage = String(err.response.data.message);
          } else if ('message' in err) {
            errorMessage = String(err.message);
          }
        }
        
        setTokenError(errorMessage);
        setTokenValid(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      let errorMessage = 'Error al restablecer la contraseña. Intenta nuevamente.';
      
      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object' && 
            'data' in err.response && err.response.data && typeof err.response.data === 'object' &&
            'message' in err.response.data) {
          errorMessage = String(err.response.data.message);
        } else if ('message' in err) {
          errorMessage = String(err.message);
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#3f37c9] mb-4" />
          <p className="text-gray-600">Validando token...</p>
        </div>
      </div>
    );
  }

  // Token invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen relative bg-[#032dff] flex items-center justify-center p-6">
        {/* Archivo Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <div className="max-w-md w-full text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ffffff] mb-6">
            <IconAlertTriangle size={32} className="text-[#e7000b]" />
          </div>
          
          <h1 className="text-3xl font-semibold text-white mb-3">
            Token Inválido
          </h1>
          
          <p className="text-white mb-6">
            {tokenError || 'El enlace de recuperación es inválido o ha expirado.'}
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Posibles razones:</strong>
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• El enlace ha expirado (válido por 60 minutos)</li>
              <li>• Ya se usó este enlace anteriormente</li>
              <li>• El enlace fue copiado incorrectamente</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link to="/forgot-password">
              <Button variant="danger" size="md" fullWidth className='mb-2'>
                Solicitar nuevo enlace
              </Button>
            </Link> 
            
            <Link to="/login">
              <Button variant="secondary" size="md" fullWidth>
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen relative bg-[#0A36CC] flex items-center justify-center p-6">
         {/* Archivo Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <div className="max-w-md w-full text-center relative z-10">
          <div className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-white mb-6">
            <IconCircleCheck size={38} className="text-[#5bba6f]" />
          </div>
          
          <h1 className="text-3xl font-semibold text-white mb-3">
            ¡Contraseña actualizada!
          </h1>
          
          <p className="text-white mb-6">
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>

          <Link to="/login">
            <Button
              variant="secondary"
              size="md"
              fullWidth
            >
              Ir a iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-0">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row">
        
        {/* Panel Izquierdo - Formulario */}
        <div className="flex flex-col flex-1 justify-center w-full lg:w-1/2 p-6 sm:p-10 lg:p-16">
          <div className="w-full max-w-md mx-auto">
            
            {/* Botón regresar */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition"
            >
              <IconArrowLeft size={18} />
              Volver al inicio de sesión
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Nueva Contraseña
              </h1>
              <p className="text-sm text-gray-500">
                Restableciendo contraseña para: <strong>{userEmail}</strong>
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              {/* Nueva Contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0A36CC]/80 focus:border-[#0A36CC] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showNewPassword ? (
                      <IconEye size={20} className="text-gray-500" />
                    ) : (
                      <IconEyeOff size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0A36CC]/80 focus:border-[#0A36CC] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showConfirmPassword ? (
                      <IconEye size={20} className="text-gray-500" />
                    ) : (
                      <IconEyeOff size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Requisitos de contraseña */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  La contraseña debe contener:
                </p>
                <ul className="space-y-1">
                  <RequirementItem 
                    met={passwordRequirements.minLength} 
                    text="Al menos 8 caracteres" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasUppercase} 
                    text="Una letra mayúscula" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasLowercase} 
                    text="Una letra minúscula" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasNumber} 
                    text="Un número" 
                  />
                  <RequirementItem 
                    met={passwordRequirements.hasSpecial} 
                    text="Un carácter especial (@$!%*?&)" 
                  />
                  {confirmPassword && (
                    <RequirementItem 
                      met={passwordsMatch} 
                      text="Las contraseñas coinciden" 
                    />
                  )}
                </ul>
              </div>

              {/* Botón submit */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                disabled={!allRequirementsMet || !passwordsMatch}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </form>
          </div>
        </div>

       {/* Panel Derecho - Decorativo */}
        <div className="hidden lg:flex items-center justify-center w-1/2 bg-[#032dff] relative overflow-hidden">
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
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-[#032dff]/20 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-[#032dff]/20 blur-3xl" />
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar requisitos
interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem = ({ met, text }: RequirementItemProps) => (
  <li className="flex items-center gap-2 text-xs">
    {met ? (
      <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )}
    <span className={met ? 'text-gray-700' : 'text-gray-500'}>{text}</span>
  </li>
);

export default ResetPasswordPage;
