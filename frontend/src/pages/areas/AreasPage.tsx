/**
 * Áreas Page
 * Lista y gestión de áreas organizacionales
 * UPDATED: Using DataTable component for consistency with DocumentosPage
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
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Badge, DataTable, ConfirmModal } from '@/components/ui';
import SearchableSelect from '@/components/ui/SearchableSelect';
import type { Column } from '@/components/ui/DataTable';
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
  const [estadoFilter, setEstadoFilter] = useState<string | number | undefined>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteAreaId, setDeleteAreaId] = useState<number | null>(null);
  const [deleteAreaName, setDeleteAreaName] = useState('');
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
      setDeleteAreaId(null);
      setDeleteAreaName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el área',
        variant: 'destructive',
      });
      setDeleteAreaId(null);
      setDeleteAreaName('');
    },
  });

  const handleDelete = (id: number, nombre: string) => {
    setDeleteAreaId(id);
    setDeleteAreaName(nombre);
  };

  const confirmDelete = () => {
    if (deleteAreaId) {
      deleteMutation.mutate(deleteAreaId);
    }
  };

  // Filter areas
  const filteredAreas = areas.filter((area: Area) => {
    const matchesSearch = area.nombre_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.siglas?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = 
      estadoFilter === 'all' ? true :
      estadoFilter === 'active' ? area.estado === true :
      estadoFilter === 'inactive' ? area.estado === false :
      true;
    
    return matchesSearch && matchesEstado;
  });

  // Paginate filtered areas
  const paginatedAreas = filteredAreas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Badge helper for estado
  const getEstadoBadge = (estado: boolean) => {
    if (estado) {
      return <Badge variant="success">Activo</Badge>;
    } else {
      return <Badge variant="info">Inactivo</Badge>;
    }
  };

  // DataTable columns
  const columns: Column<any>[] = [
    {
      header: 'Nombre',
      id: 'nombre',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.nombre_area}</div>
      ),
      sortable: true,
    },
    {
      header: 'Siglas',
      accessorKey: 'siglas',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.siglas || '-'}</span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      align: 'center',
      cell: ({ row }) => getEstadoBadge(row.original.estado),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          {canWrite && (
            <button
              onClick={() => navigate(`/areas/${row.original.id_area}/editar`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <IconEdit size={18} />
            </button>
          )}
          {canAdmin && (
            <button
              onClick={() => handleDelete(row.original.id_area, row.original.nombre_area)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <IconTrash size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o siglas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
            />
          </div>

          {/* Estado Filter */}
          <div className="w-full sm:w-54">
            <SearchableSelect
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' }
              ]}
              value={estadoFilter}
              onChange={(value) => {
                setEstadoFilter(value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar por estado"
            />
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {filteredAreas.length} {filteredAreas.length === 1 ? 'área' : 'áreas'}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedAreas}
          isLoading={isLoading}
          emptyMessage={searchTerm || estadoFilter !== 'all' ? 'No se encontraron áreas con los filtros seleccionados' : 'No hay áreas registradas'}
        />
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteAreaId}
        onClose={() => {
          setDeleteAreaId(null);
          setDeleteAreaName('');
        }}
        onConfirm={confirmDelete}
        title="Eliminar Área"
        message={`¿Estás seguro de eliminar el área "${deleteAreaName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
};

export default AreasPage;
