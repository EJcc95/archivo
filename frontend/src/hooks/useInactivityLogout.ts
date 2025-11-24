import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const WARNING_TIME = 1 * 60 * 1000; // 1 minuto antes del logout (total 4 min)
const STORAGE_KEY = 'lastActivity';
const SESSION_BROADCAST_CHANNEL = 'session_activity';

interface InactivityState {
  showWarning: boolean;
  timeRemaining: number;
}

export function useInactivityLogout() {
  const { logout, isAuthenticated } = useAuth();
  const [inactivityState, setInactivityState] = useState<InactivityState>({
    showWarning: false,
    timeRemaining: 60,
  });
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Inicializar BroadcastChannel para comunicación entre pestañas
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      broadcastChannelRef.current = new BroadcastChannel(SESSION_BROADCAST_CHANNEL);

      // Escuchar mensajes de otras pestañas
      broadcastChannelRef.current.onmessage = (event) => {
        const { type } = event.data;

        if (type === 'ACTIVITY') {
          // Otra pestaña tiene actividad, reiniciar timers
          resetInactivityTimer();
        } else if (type === 'LOGOUT') {
          // Se cerró sesión en otra pestaña, cerrar esta también
          performLogout();
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel no disponible:', error);
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [isAuthenticated]);

  // Registrar actividad del usuario
  const registerActivity = () => {
    if (!isAuthenticated) return;

    // Guardar timestamp de última actividad
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    // Notificar a otras pestañas sobre actividad
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'ACTIVITY',
          timestamp: Date.now(),
        });
      } catch (error) {
        console.warn('Error enviando actividad a otras pestañas:', error);
      }
    }

    // Reiniciar timer de inactividad
    resetInactivityTimer();
  };

  // Reiniciar timer de inactividad
  const resetInactivityTimer = () => {
    // Limpiar timers anteriores
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Ocultar modal de advertencia
    setInactivityState({
      showWarning: false,
      timeRemaining: 60,
    });

    // Timer para mostrar advertencia (4 minutos después del último evento)
    warningTimerRef.current = setTimeout(() => {
      setInactivityState({
        showWarning: true,
        timeRemaining: 60,
      });

      // Iniciar countdown
      let remaining = 60;
      countdownTimerRef.current = setInterval(() => {
        remaining--;
        setInactivityState((prev) => ({
          ...prev,
          timeRemaining: remaining,
        }));

        if (remaining <= 0 && countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Timer para logout automático (5 minutos después del último evento)
    inactivityTimerRef.current = setTimeout(() => {
      performLogout();
    }, INACTIVITY_TIMEOUT);
  };

  // Realizar logout
  const performLogout = () => {
    // Limpiar timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Limpiar última actividad
    localStorage.removeItem(STORAGE_KEY);

    // Notificar a otras pestañas
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'LOGOUT',
          timestamp: Date.now(),
        });
      } catch (error) {
        console.warn('Error notificando logout a otras pestañas:', error);
      }
    }

    // Hacer logout
    logout();
  };

  // Extender sesión (dismiss warning)
  const extendSession = () => {
    registerActivity();
  };

  // Escuchar eventos de actividad del usuario
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      registerActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Inicializar timer
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isAuthenticated]);

  return {
    ...inactivityState,
    extendSession,
    performLogout,
  };
}
