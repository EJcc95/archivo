import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes } from './ProtectedRoutes';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

// Module Pages
import UsersPage from '@/pages/usuarios/UsersPage';
import RolesPage from '@/pages/roles/RolesPage';
import AreasRouter from '@/pages/areas';
import ArchivadoresRouter from '@/pages/archivadores';
import DocumentosRouter from '@/pages/documentos';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Modules */}
        <Route path="/usuarios/*" element={<UsersPage />} />
        <Route path="/roles/*" element={<RolesPage />} />
        <Route path="/areas/*" element={<AreasRouter />} />
        <Route path="/archivadores/*" element={<ArchivadoresRouter />} />
        <Route path="/documentos/*" element={<DocumentosRouter />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
