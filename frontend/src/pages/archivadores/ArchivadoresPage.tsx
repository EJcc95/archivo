/**
 * Archivadores Page
 * Lista y gestión de archivadores
 * UPDATED: Using DataTable component and Badge for consistent UI
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
import { PageContainer, PageHeader, Pagination, Badge, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
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
        return <IconFolderOpen size={14} className="text-green-600" />;
      case 'Cerrado':
        return <IconFolderFilled size={14} className="text-gray-600" />;
      case 'En Custodia':
        return <IconLock size={14} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: Archivador['estado']) => {
    switch (estado) {
      case 'Abierto':
        return <Badge variant="success" icon={getEstadoIcon(estado)}>{estado}</Badge>;
      case 'Cerrado':
        return <Badge variant="info" icon={getEstadoIcon(estado)}>{estado}</Badge>;
      case 'En Custodia':
        return <Badge variant="primary" icon={getEstadoIcon(estado)}>{estado}</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  // DataTable columns
  const columns: Column<any>[] = [
    {
      header: 'Nombre',
      id: 'nombre',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.nombre_archivador}</div>
          {row.original.descripcion && (
            <div className="text-sm text-gray-500 truncate max-w-md">{row.original.descripcion}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Área',
      accessorKey: 'areaPropietaria',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.areaPropietaria?.nombre_area || '-'}
        </span>
      ),
    },
    {
      header: 'Ubicación',
      accessorKey: 'ubicacion_fisica',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.ubicacion_fisica || '-'}</span>
      ),
    },
    {
      header: 'Folios',
      accessorKey: 'total_folios',
      align: 'center',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">{row.original.total_folios}</span>
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
          {!row.original.eliminado ? (
            <>
              {canWrite && (
                <button
                  onClick={() => navigate(`/archivadores/${row.original.id_archivador}/editar`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <IconEdit size={18} />
                </button>
              )}
              {canAdmin && (
                <button
                  onClick={() => handleDelete(row.original.id_archivador, row.original.nombre_archivador)}
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
                onClick={() => handleRestore(row.original.id_archivador)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Restaurar"
              >
                <IconRestore size={18} />
              </button>
            )
          )}
        </div>
      ),
    },
  ];

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
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
            />
          </div>
          
          {canAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => handleShowDeletedChange(e.target.checked)}
                className="w-4 h-4 text-[#032DFF] border-gray-300 rounded focus:ring-[#032DFF]"
              />
              Mostrar eliminados
            </label>
          )}
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedArchivadores}
          isLoading={isLoading}
          emptyMessage={searchTerm ? 'No se encontraron archivadores' : 'No hay archivadores registrados'}
          rowClassName={(row) => row.eliminado ? 'opacity-50' : ''}
        />

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
