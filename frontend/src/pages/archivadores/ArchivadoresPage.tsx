/**
 * Archivadores Page
 * Lista y gestión de archivadores
 * UPDATED: Using DataTable component, Badge, SearchableSelect and improved filters
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
  IconX,
  IconFilter,
} from '@tabler/icons-react';
import { 
  PageContainer, 
  PageHeader, 
  Badge, 
  DataTable, 
  Input, 
  SearchableSelect, 
  Card, 
  CardBody,
  Button,
  ConfirmModal
} from '@/components/ui';
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
  const [filterArea, setFilterArea] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [deleteArchId, setDeleteArchId] = useState<number | null>(null);
  const [deleteArchName, setDeleteArchName] = useState('');
  
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
      setDeleteArchId(null);
      setDeleteArchName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivador',
        variant: 'destructive',
      });
      setDeleteArchId(null);
      setDeleteArchName('');
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

  const handleDelete = (id: number, nombre: string) => {
    setDeleteArchId(id);
    setDeleteArchName(nombre);
  };

  const confirmDelete = () => {
    if (deleteArchId) {
      deleteMutation.mutate(deleteArchId);
    }
  };

  const handleRestore = async (id: number) => {
    restoreMutation.mutate(id);
  };

  // Prepare SearchableSelect options
  const areaOptions = areas.map((area: any) => ({
    value: String(area.id_area),
    label: area.nombre_area,
  }));

  const estadoOptions = [
    { value: 'Abierto', label: 'Abierto' },
    { value: 'Cerrado', label: 'Cerrado' },
    { value: 'En Custodia', label: 'En Custodia' },
  ];

  // Filter archivadores
  const filteredArchivadores = archivadores.filter((arch: Archivador) => {
    const matchesSearch = arch.nombre_archivador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         arch.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeleted = showDeleted ? arch.eliminado : !arch.eliminado;
    const matchesArea = !filterArea || String(arch.id_area_propietaria) === filterArea;
    const matchesEstado = !filterEstado || arch.estado === filterEstado;
    
    return matchesSearch && matchesDeleted && matchesArea && matchesEstado;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterArea('');
    setFilterEstado('');
    setShowDeleted(false);
  };

  const hasActiveFilters = searchTerm || filterArea || filterEstado || showDeleted;

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
        actionButton={canWrite ? (
          <Button 
            onClick={() => navigate('/archivadores/nuevo')}
            startIcon={<IconPlus size={20} className="text-[#0A36CC]" />}
            className="bg-white text-[#0A36CC] hover:bg-gray-50 border border-gray-200"
          >
            Nuevo Archivador
          </Button>
        ) : undefined}
      />

      <div className="p-6 space-y-6">
        {/* Filters Card */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-4">
              <IconFilter size={20} className="text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <IconSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Buscar archivador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Area Filter */}
              <div>
                <SearchableSelect
                  options={areaOptions}
                  value={filterArea}
                  onChange={(value) => setFilterArea(String(value))}
                  placeholder="Filtrar por área"
                  emptyMessage="No se encontraron áreas"
                />
              </div>

              {/* Estado Filter */}
              <div>
                <SearchableSelect
                  options={estadoOptions}
                  value={filterEstado}
                  onChange={(value) => setFilterEstado(String(value))}
                  placeholder="Filtrar por estado"
                  emptyMessage="No hay estados"
                />
              </div>
            </div>

            {/* Show deleted checkbox and clear filters */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {canAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                    className="w-4 h-4 text-[#0A36CC] border-gray-300 rounded focus:ring-[#0A36CC]"
                  />
                  Mostrar eliminados
                </label>
              )}
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  startIcon={<IconX size={16} />}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Mostrando <strong>{filteredArchivadores.length}</strong> archivador{filteredArchivadores.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredArchivadores}
          isLoading={isLoading}
          emptyMessage={searchTerm ? 'No se encontraron archivadores' : 'No hay archivadores registrados'}
          rowClassName={(row) => row.eliminado ? 'opacity-50' : ''}
          pageSize={25}
        />
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteArchId}
        onClose={() => {
          setDeleteArchId(null);
          setDeleteArchName('');
        }}
        onConfirm={confirmDelete}
        title="Eliminar Archivador"
        message={`¿Estás seguro de eliminar el archivador "${deleteArchName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
};

export default ArchivadoresPage;
