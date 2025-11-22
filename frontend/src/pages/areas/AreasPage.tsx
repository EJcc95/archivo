import { useEffect, useState } from 'react';
import { areaService } from '@/services';
import type { Area } from '@/types/models';

const AreasPage = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const data = await areaService.getAll();
      setAreas(data);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Áreas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Código</th>
              <th className="px-4 py-2 border-b">Descripción</th>
              <th className="px-4 py-2 border-b">Estado</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id_area}>
                <td className="px-4 py-2 border-b">{area.nombre_area}</td>
                <td className="px-4 py-2 border-b">{area.codigo_area}</td>
                <td className="px-4 py-2 border-b">{area.descripcion}</td>
                <td className="px-4 py-2 border-b">{area.estado ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AreasPage;
