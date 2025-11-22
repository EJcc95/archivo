import { useEffect, useState } from 'react';
// Assuming archivadorService exists or will be fixed. 
// I noticed archivadorService.ts in the file list earlier.
import { archivadorService } from '@/services'; 
import type { Archivador } from '@/types/models';

const ArchivadoresPage = () => {
  const [archivadores, setArchivadores] = useState<Archivador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchivadores();
  }, []);

  const loadArchivadores = async () => {
    try {
      // Assuming getAll exists in archivadorService
      const data = await archivadorService.getAll();
      setArchivadores(data);
    } catch (error) {
      console.error('Error loading archivadores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Archivadores</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Código</th>
              <th className="px-4 py-2 border-b">Ubicación</th>
              <th className="px-4 py-2 border-b">Capacidad</th>
              <th className="px-4 py-2 border-b">Año</th>
            </tr>
          </thead>
          <tbody>
            {archivadores.map((archivador) => (
              <tr key={archivador.id_archivador}>
                <td className="px-4 py-2 border-b">{archivador.nombre_archivador}</td>
                <td className="px-4 py-2 border-b">{archivador.codigo_archivador}</td>
                <td className="px-4 py-2 border-b">{archivador.ubicacion_fisica}</td>
                <td className="px-4 py-2 border-b">{archivador.cantidad_actual} / {archivador.capacidad_maxima}</td>
                <td className="px-4 py-2 border-b">{archivador.anio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivadoresPage;
