import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoutes } from './ProtectedRoutes';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

// Module Pages
import { Suspense, lazy } from 'react';

// Lazy load module pages to avoid circular dependencies
const RolesRouter = lazy(() => import('@/pages/roles'));
const AreasRouter = lazy(() => import('@/pages/areas'));
const ArchivadoresRouter = lazy(() => import('@/pages/archivadores'));
const DocumentosRouter = lazy(() => import('@/pages/documentos'));
const TiposDocumentoPage = lazy(() => import('@/pages/tipos-documento/TiposDocumentoPage'));
const TipoDocumentoNuevoPage = lazy(() => import('@/pages/tipos-documento/TipoDocumentoNuevoPage'));
const TipoDocumentoEditarPage = lazy(() => import('@/pages/tipos-documento/TipoDocumentoEditarPage'));
const UsuariosPage = lazy(() => import('@/pages/usuarios/UsuariosPage'));
const UsuarioNuevoPage = lazy(() => import('@/pages/usuarios/UsuarioNuevoPage'));
const UsuarioEditarPage = lazy(() => import('@/pages/usuarios/UsuarioEditarPage'));
const ConfiguracionPage = lazy(() => import('@/pages/configuracion/ConfiguracionPage'));
const ReportesPage = lazy(() => import('@/pages/reportes/ReportesPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const PrestamosPage = lazy(() => import('@/pages/prestamos/PrestamosPage'));
const PrestamoNuevoPage = lazy(() => import('@/pages/prestamos/PrestamoNuevoPage'));
const PrestamoEditarPage = lazy(() => import('@/pages/prestamos/PrestamoEditarPage'));
const PrestamoDetallePage = lazy(() => import('@/pages/prestamos/PrestamoDetallePage'));
const AuditoriaPage = lazy(() => import('@/pages/auditoria/AuditoriaPage'));

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Modules wrapped in Suspense */}
        <Route element={
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
        }>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/usuarios/nuevo" element={<UsuarioNuevoPage />} />
          <Route path="/usuarios/:id/editar" element={<UsuarioEditarPage />} />
          <Route path="/roles/*" element={<RolesRouter />} />
          <Route path="/areas/*" element={<AreasRouter />} />
          <Route path="/archivadores/*" element={<ArchivadoresRouter />} />
          <Route path="/documentos/*" element={<DocumentosRouter />} />
          
          {/* Tipos de Documento */}
          <Route path="/tipos-documento" element={<TiposDocumentoPage />} />
          <Route path="/tipos-documento/nuevo" element={<TipoDocumentoNuevoPage />} />
          <Route path="/tipos-documento/:id/editar" element={<TipoDocumentoEditarPage />} />
          
          {/* Configuración */}
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          
          {/* Auditoría */}
          <Route path="/auditoria" element={<AuditoriaPage />} />
          
          {/* Reportes */}
          <Route path="/reportes" element={<ReportesPage />} />
          
          {/* Perfil */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Préstamos */}
          <Route path="/prestamos" element={<PrestamosPage />} />
          <Route path="/prestamos/nuevo" element={<PrestamoNuevoPage />} />
          <Route path="/prestamos/:id/editar" element={<PrestamoEditarPage />} />
          <Route path="/prestamos/:id" element={<PrestamoDetallePage />} />
        </Route>

      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
