import { useEffect } from 'react';
import { IconAlertTriangle, IconLogout, IconClock } from '@tabler/icons-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function InactivityWarningModal({
  isOpen,
  timeRemaining,
  onExtend,
  onLogout,
}: InactivityWarningModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <IconAlertTriangle className="text-amber-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Sesión por expirar</h2>
            <p className="text-sm text-gray-500">Tu sesión se cerrará por inactividad</p>
          </div>
        </div>

        {/* Message */}
        <p className="mb-6 text-gray-600">
          No hemos detectado actividad en tu cuenta. Tu sesión se cerrará automáticamente en:
        </p>

        {/* Timer */}
        <div className="mb-8 rounded-lg bg-linear-to-r from-amber-50 to-orange-50 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IconClock size={20} className="text-amber-600" />
            <div className="text-4xl font-bold text-amber-600">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          <p className="text-sm text-gray-600">minutos y segundos restantes</p>
        </div>

        {/* Info message */}
        <p className="mb-6 text-sm text-gray-500">
          Si realizas alguna acción antes del tiempo indicado, tu sesión se renovará automáticamente.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onExtend}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#032DFF] to-[#0225cc] px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            Continuar sesión
          </button>
          <button
            onClick={onLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <IconLogout size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
