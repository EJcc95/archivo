import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes } from './ProtectedRoutes';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

// Placeholder components for modules (to be replaced with actual pages as we verify them)
// const UsersPage = () => <div>Usuarios Module</div>;
// const RolesPage = () => <div>Roles Module</div>;
// const AreasPage = () => <div>Areas Module</div>;
// const ArchivadoresPage = () => <div>Archivadores Module</div>;
// const DocumentosPage = () => <div>Documentos Module</div>;

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
        
        {/* Modules - To be implemented/connected */}
        {/* <Route path="/usuarios/*" element={<UsersPage />} /> */}
        {/* <Route path="/roles/*" element={<RolesPage />} /> */}
        {/* <Route path="/areas/*" element={<AreasPage />} /> */}
        {/* <Route path="/archivadores/*" element={<ArchivadoresPage />} /> */}
        {/* <Route path="/documentos/*" element={<DocumentosPage />} /> */}
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
