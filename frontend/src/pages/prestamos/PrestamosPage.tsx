import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconTransfer, IconPlus, IconEye, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import { PageContainer, PageHeader, Pagination } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

const PrestamosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  // Map to existing database permissions
  const canCreate = hasPermission('prestamos_request') || hasPermission('prestamos_admin');
  const canView = hasPermission('prestamos_request') || hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canEdit = hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canDelete = hasPermission('prestamos_admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch prestamos
  const { data: prestamos = [], isLoading } = useQuery({
    queryKey: ['prestamos', filterEstado],
    queryFn: () => prestamoService.getAll(filterEstado ? { estado: filterEstado } : undefined),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: prestamoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestamos'] });
      toast({
        title: 'Préstamo eliminado',
        description: 'El préstamo ha sido eliminado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el préstamo',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el préstamo de "${nombre}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter prestamos by search term
  const filteredPrestamos = prestamos.filter((prestamo: Prestamo) =>
    prestamo.Archivador?.nombre_archivador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestamo.areaSolicitante?.nombre_area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestamo.motivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate
  const totalPages = Math.ceil(filteredPrestamos.length / itemsPerPage);
  const paginatedPrestamos = filteredPrestamos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
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
        icon={<IconTransfer size={28} className="text-white" strokeWidth={2} />}
        actionButtons={
          canCreate ? [{
            onClick: () => navigate('/prestamos/nuevo'),
            label: 'Nuevo Préstamo',
            icon: <IconPlus size={20} />,
          }] : undefined
        }
      />

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por archivador, área o motivo..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3f37c9] focus:border-transparent h-[42px]"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3f37c9] focus:border-transparent h-[42px]"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Devuelto">Devueltos</option>
            <option value="Vencido">Vencidos</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Mostrando <strong>{paginatedPrestamos.length}</strong> de <strong>{filteredPrestamos.length}</strong> préstamos
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3f37c9]"></div>
          </div>
        ) : filteredPrestamos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No se encontraron préstamos' : 'No hay préstamos registrados'}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Archivador</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Área Solicitante</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Préstamo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución Esperada</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPrestamos.map((prestamo: Prestamo) => (
                    <tr key={prestamo.id_prestamo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{prestamo.Archivador?.nombre_archivador || '-'}</div>
                        <div className="text-xs text-gray-500">{prestamo.motivo}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {prestamo.areaSolicitante?.nombre_area || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(prestamo.estado)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {canView && (
                            <button
                              onClick={() => navigate(`/prestamos/${prestamo.id_prestamo}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver Detalle"
                            >
                              <IconEye size={18} />
                            </button>
                          )}
                          {canEdit && prestamo.estado === 'Activo' && (
                            <button
                              onClick={() => navigate(`/prestamos/${prestamo.id_prestamo}/editar`)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <IconEdit size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(prestamo.id_prestamo, prestamo.Archivador?.nombre_archivador || 'este préstamo')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <IconTrash size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredPrestamos.length}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default PrestamosPage;
