/**
 * App Component
 * Componente raíz de la aplicación
 */

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/auth';
import { AppRouter } from '@/routes/AppRouter';
import { SidebarProvider } from '@/context/SidebarContext';
import { InactivityWarningModal } from '@/components/ui';
import { useInactivityLogout } from '@/hooks';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function AppContent() {
  const { showWarning, timeRemaining, extendSession, performLogout } = useInactivityLogout();

  return (
    <>
      <AppRouter />
      <InactivityWarningModal
        isOpen={showWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
        onLogout={performLogout}
      />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
