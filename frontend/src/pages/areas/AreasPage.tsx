/**
 * Áreas Page
 * Lista y gestión de áreas organizacionales
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconFolders,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination } from '@/components/ui';
import { areaService } from '@/services';
import { usePermissions } from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Area } from '@/types/models';

const AreasPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  const canWrite = hasPermission('areas_write');
  const canAdmin = hasPermission('areas_admin');

  // Fetch areas
  const { data: areasData, isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  // Ensure areas is always an array
  const areas = Array.isArray(areasData) ? areasData : [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: areaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({
        title: 'Área eliminada',
        description: 'El área ha sido eliminada correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el área',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el área "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter areas
  const filteredAreas = areas.filter((area: Area) =>
    area.nombre_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.siglas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered areas
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
  const paginatedAreas = filteredAreas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Áreas"
        description="Gestión de áreas organizacionales"
        icon={<IconFolders size={28} className="text-white" strokeWidth={2} />}
        actionButtons={canWrite ? [
          {
            label: 'Nueva Área',
            onClick: () => navigate('/areas/nuevo'),
            icon: <IconPlus size={18} />,
            variant: 'primary',
          },
        ] : undefined}
      />

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o siglas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedAreas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No se encontraron áreas' : 'No hay áreas registradas'}
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
                    Siglas
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
                {paginatedAreas.map((area: Area) => (
                  <tr key={area.id_area} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{area.nombre_area}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{area.siglas || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {area.estado ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <IconCheck size={14} />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <IconX size={14} />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canWrite && (
                          <button
                            onClick={() => navigate(`/areas/${area.id_area}/editar`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconEdit size={18} />
                          </button>
                        )}
                        {canAdmin && (
                          <button
                            onClick={() => handleDelete(area.id_area, area.nombre_area)}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAreas.length}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default AreasPage;
