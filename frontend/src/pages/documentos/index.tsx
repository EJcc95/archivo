/**
 * Documentos Module Router
 * Handles routing for all documento-related pages
 */

import { Routes, Route } from 'react-router-dom';
import DocumentosPage from './DocumentosPage';
import DocumentoNuevoPage from './DocumentoNuevoPage';
import DocumentoEditarPage from './DocumentoEditarPage';
import DocumentoDetallePage from './DocumentoDetallePage';

const DocumentosRouter = () => {
  return (
    <Routes>
      <Route index element={<DocumentosPage />} />
      <Route path="nuevo" element={<DocumentoNuevoPage />} />
      <Route path=":id" element={<DocumentoDetallePage />} />
      <Route path=":id/editar" element={<DocumentoEditarPage />} />
    </Routes>
  );
};

export default DocumentosRouter;
