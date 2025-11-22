/**
 * Áreas Module Router
 * Handles routing for all área-related pages
 */

import { Routes, Route } from 'react-router-dom';
import AreasPage from './AreasPage';
import AreaNuevoPage from './AreaNuevoPage';
import AreaEditarPage from './AreaEditarPage';

const AreasRouter = () => {
  return (
    <Routes>
      <Route index element={<AreasPage />} />
      <Route path="nuevo" element={<AreaNuevoPage />} />
      <Route path=":id/editar" element={<AreaEditarPage />} />
    </Routes>
  );
};

export default AreasRouter;
