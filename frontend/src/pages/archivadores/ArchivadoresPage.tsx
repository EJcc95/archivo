/**
 * Archivadores Page
 * Lista y gestión de archivadores
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconArchive,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconFolderOpen,
  IconFolderFilled,
  IconLock,
  IconRestore,
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination } from '@/components/ui';
import { archivadorService, areaService } from '@/services';
import { usePermissions } from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Archivador } from '@/types/models';

const ArchivadoresPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  const canWrite = hasPermission('arch_write');
  const canAdmin = hasPermission('arch_admin');

  // Fetch archivadores
  const { data: archivadoresData, isLoading } = useQuery({
    queryKey: ['archivadores'],
    queryFn: archivadorService.getAll,
  });

  // Fetch areas for filtering
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  // Ensure data is always arrays
  const archivadores = Array.isArray(archivadoresData) ? archivadoresData : [];
  const areas = Array.isArray(areasData) ? areasData : [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: archivadorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivadores'] });
      toast({
        title: 'Archivador eliminado',
        description: 'El archivador ha sido eliminado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivador',
        variant: 'destructive',
      });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: archivadorService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivadores'] });
      toast({
        title: 'Archivador restaurado',
        description: 'El archivador ha sido restaurado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo restaurar el archivador',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el archivador "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = async (id: number) => {
    restoreMutation.mutate(id);
  };

  // Filter archivadores
  const filteredArchivadores = archivadores.filter((arch: Archivador) => {
    const matchesSearch = arch.nombre_archivador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeleted = showDeleted ? arch.eliminado : !arch.eliminado;
    return matchesSearch && matchesDeleted;
  });

  // Paginate filtered archivadores
  const totalPages = Math.ceil(filteredArchivadores.length / itemsPerPage);
  const paginatedArchivadores = filteredArchivadores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleShowDeletedChange = (checked: boolean) => {
    setShowDeleted(checked);
    setCurrentPage(1);
  };

  const getEstadoIcon = (estado: Archivador['estado']) => {
    switch (estado) {
      case 'Abierto':
        return <IconFolderOpen size={16} className="text-green-600" />;
      case 'Cerrado':
        return <IconFolderFilled size={16} className="text-gray-600" />;
      case 'En Custodia':
        return <IconLock size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getEstadoClass = (estado: Archivador['estado']) => {
    switch (estado) {
      case 'Abierto':
        return 'bg-green-100 text-green-800';
      case 'Cerrado':
        return 'bg-gray-100 text-gray-800';
      case 'En Custodia':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Archivadores"
        description="Gestión de archivadores físicos"
        icon={<IconArchive size={28} className="text-white" strokeWidth={2} />}
        actionButtons={canWrite ? [
          {
            label: 'Nuevo Archivador',
            onClick: () => navigate('/archivadores/nuevo'),
            icon: <IconPlus size={18} />,
            variant: 'primary',
          },
        ] : undefined}
      />

      <div className="p-6 space-y-6">
        {/* Search Bar & Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar archivador..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {canAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => handleShowDeletedChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Mostrar eliminados
            </label>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedArchivadores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No se encontraron archivadores' : 'No hay archivadores registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folios
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedArchivadores.map((archivador: Archivador) => (
                  <tr key={archivador.id_archivador} className={`hover:bg-gray-50 ${archivador.eliminado ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{archivador.nombre_archivador}</div>
                      {archivador.descripcion && (
                        <div className="text-sm text-gray-500">{archivador.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {archivador.areaPropietaria?.nombre_area || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{archivador.ubicacion_fisica || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{archivador.total_folios}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoClass(archivador.estado)}`}>
                        {getEstadoIcon(archivador.estado)}
                        {archivador.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!archivador.eliminado ? (
                          <>
                            {canWrite && (
                              <button
                                onClick={() => navigate(`/archivadores/${archivador.id_archivador}/editar`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <IconEdit size={18} />
                              </button>
                            )}
                            {canAdmin && (
                              <button
                                onClick={() => handleDelete(archivador.id_archivador, archivador.nombre_archivador)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <IconTrash size={18} />
                              </button>
                            )}
                          </>
                        ) : (
                          canAdmin && (
                            <button
                              onClick={() => handleRestore(archivador.id_archivador)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restaurar"
                            >
                              <IconRestore size={18} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredArchivadores.length}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default ArchivadoresPage;
