import { Routes, Route } from 'react-router-dom';
import RolesPage from './RolesPage';
import RolNuevoPage from './RolNuevoPage';
import RolEditarPage from './RolEditarPage';
import RolDetallePage from './RolDetallePage';
import RolPermisosPage from './RolPermisosPage';

const RolesRouter = () => {
  return (
    <Routes>
      <Route index element={<RolesPage />} />
      <Route path="nuevo" element={<RolNuevoPage />} />
      <Route path=":id" element={<RolDetallePage />} />
      <Route path=":id/editar" element={<RolEditarPage />} />
      <Route path=":id/permisos" element={<RolPermisosPage />} />
    </Routes>
  );
};

export default RolesRouter;
