/**
 * Archivadores Module Router
 * Handles routing for all archivador-related pages
 */

import { Routes, Route } from 'react-router-dom';
import ArchivadoresPage from './ArchivadoresPage';
import ArchivadorNuevoPage from './ArchivadorNuevoPage';
import ArchivadorEditarPage from './ArchivadorEditarPage';

const ArchivadoresRouter = () => {
  return (
    <Routes>
      <Route index element={<ArchivadoresPage />} />
      <Route path="nuevo" element={<ArchivadorNuevoPage />} />
      <Route path=":id/editar" element={<ArchivadorEditarPage />} />
    </Routes>
  );
};

export default ArchivadoresRouter;
