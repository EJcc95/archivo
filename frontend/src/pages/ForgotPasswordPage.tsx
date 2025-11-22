/**
 * Forgot Password Page
 * Página para solicitar recuperación de contraseña
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconMail, IconCircleCheck } from '@tabler/icons-react';
import Button from '@/components/ui/Button';
import { requestPasswordReset } from '@/services/passwordResetService';
import logoAEMWhite from '@/assets/logo-aem-white.png';


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setEmail(''); // Limpiar el formulario
    } catch (err: unknown) {
      let errorMessage = 'Error al procesar la solicitud. Intenta nuevamente.';
      
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

            {!success ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    ¿Olvidaste tu contraseña?
                  </h1>
                  <p className="text-sm text-gray-500">
                    No te preocupes, te enviaremos instrucciones para recuperarla.
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

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email registrado <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IconMail 
                        size={20} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        autoComplete="email"
                        required
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2  focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-colors"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Ingresa el email asociado a tu cuenta
                    </p>
                  </div>

                  {/* Botón submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Mensaje de éxito */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                    <IconCircleCheck size={32} className="text-green-600" />
                  </div>
                  
                  <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                    ¡Revisa tu email!
                  </h1>
                  
                  <p className="text-gray-600 mb-6">
                    Si el email existe en nuestro sistema, recibirás un enlace de recuperación en unos minutos.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> El enlace expirará en 60 minutos y solo puede ser usado una vez.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      ¿No recibiste el email?
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1 text-left bg-gray-50 rounded-lg p-4">
                      <li>• Revisa tu carpeta de spam o correo no deseado</li>
                      <li>• Verifica que el email sea correcto</li>
                      <li>• Espera unos minutos, puede tardar en llegar</li>
                    </ul>
                  </div>

                  <div className="mt-8 space-y-3">
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => setSuccess(false)}
                    >
                      Intentar con otro email
                    </Button>
                    
                    <Link to="/login">
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                      >
                        Volver al inicio de sesión
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
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

export default ForgotPasswordPage;
