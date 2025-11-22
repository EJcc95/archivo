import { useEffect, useState } from 'react';
import { documentoService } from '@/services';
import type { Documento } from '@/types/models';

const DocumentosPage = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentos();
  }, []);

  const loadDocumentos = async () => {
    try {
      const data = await documentoService.getAll();
      setDocumentos(data);
    } catch (error) {
      console.error('Error loading documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Documentos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Código</th>
              <th className="px-4 py-2 border-b">Asunto</th>
              <th className="px-4 py-2 border-b">Fecha</th>
              <th className="px-4 py-2 border-b">Folios</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc) => (
              <tr key={doc.id_documento}>
                <td className="px-4 py-2 border-b">{doc.nombre_documento}</td>
                <td className="px-4 py-2 border-b">{doc.codigo_documento}</td>
                <td className="px-4 py-2 border-b">{doc.asunto}</td>
                <td className="px-4 py-2 border-b">{new Date(doc.fecha_documento).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b">{doc.numero_folios}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentosPage;
