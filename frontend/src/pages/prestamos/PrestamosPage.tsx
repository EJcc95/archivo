import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconFolders, IconPlus, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const PrestamosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  // Map to existing database permissions:
  // prestamos_request - Create and view own loan requests
  // prestamos_approve - Approve, reject, and manage returns (edit)
  // prestamos_admin - Complete loan system management (delete)
  const canCreate = hasPermission('prestamos_request') || hasPermission('prestamos_admin');
  const canView = hasPermission('prestamos_request') || hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canEdit = hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canDelete = hasPermission('prestamos_admin');

  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>('');

  useEffect(() => {
    loadPrestamos();
  }, [filterEstado]);

  const loadPrestamos = async () => {
    try {
      setLoading(true);
      const data = await prestamoService.getAll(filterEstado ? { estado: filterEstado } : undefined);
      setPrestamos(data);
    } catch (error) {
      console.error('Error loading loans:', error);
      toast.error('Error al cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.')) return;

    try {
      await prestamoService.delete(id);
      toast.success('Préstamo eliminado correctamente');
      loadPrestamos();
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error('Error al eliminar el préstamo');
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles = {
      Activo: 'bg-blue-100 text-blue-800',
      Devuelto: 'bg-green-100 text-green-800',
      Vencido: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {estado}
      </span>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Préstamos de Archivadores"
        description="Gestión de préstamos y devoluciones de documentos físicos"
        icon={<IconFolders size={24} />}
        actionButton={
          canCreate ? (
            <Button onClick={() => navigate('/prestamos/nuevo')} startIcon={<IconPlus size={20} />}>
              Nuevo Préstamo
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex gap-4">
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Devuelto">Devueltos</option>
          <option value="Vencido">Vencidos</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Archivador</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Solicitante</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Fecha Préstamo</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Devolución Esperada</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Cargando préstamos...
                  </td>
                </tr>
              ) : prestamos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay préstamos registrados
                  </td>
                </tr>
              ) : (
                prestamos.map((prestamo) => (
                  <tr key={prestamo.id_prestamo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {prestamo.Archivador?.nombre_archivador}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {prestamo.solicitante?.nombres} {prestamo.solicitante?.apellidos}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(prestamo.estado)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canView && (
                        <button
                          onClick={() => navigate(`/prestamos/${prestamo.id_prestamo}`)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Ver Detalle"
                        >
                          <IconEye size={18} />
                        </button>
                      )}
                      {canEdit && prestamo.estado === 'Activo' && (
                        <button
                          onClick={() => navigate(`/prestamos/${prestamo.id_prestamo}/editar`)}
                          className="text-orange-600 hover:text-orange-800 p-1 rounded-md hover:bg-orange-50 transition-colors"
                          title="Editar"
                        >
                          <IconEdit size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(prestamo.id_prestamo)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrestamosPage;
