import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconTransfer, IconPlus, IconEye, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import { PageContainer, PageHeader, Pagination, Badge, DataTable, ConfirmModal, SearchableSelect } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

const PrestamosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  // Permissions
  const canCreate = hasPermission('prestamos_request');
  const canView = hasPermission('prestamos_request') || hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canReturn = hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canEdit = hasPermission('prestamos_approve') || hasPermission('prestamos_admin');
  const canDelete = hasPermission('prestamos_admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletePrestamoId, setDeletePrestamoId] = useState<number | null>(null);
  const [deletePrestamoName, setDeletePrestamoName] = useState('');
  const [returnPrestamoId, setReturnPrestamoId] = useState<number | null>(null);
  const [returnObservations, setReturnObservations] = useState('');
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
      setDeletePrestamoId(null);
      setDeletePrestamoName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el préstamo',
        variant: 'destructive',
      });
      setDeletePrestamoId(null);
      setDeletePrestamoName('');
    },
  });

  // Return mutation
  const returnMutation = useMutation({
    mutationFn: (id: number) => prestamoService.returnPrestamo(id, { observaciones: returnObservations }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestamos'] });
      toast({
        title: 'Éxito',
        description: 'Préstamo marcado como devuelto correctamente',
      });
      setReturnPrestamoId(null);
      setReturnObservations('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo marcar el préstamo como devuelto',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number, nombre: string) => {
    setDeletePrestamoId(id);
    setDeletePrestamoName(nombre);
  };

  const confirmDelete = () => {
    if (deletePrestamoId) {
      deleteMutation.mutate(deletePrestamoId);
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
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
      Activo: { variant: 'primary' },
      Devuelto: { variant: 'success' },
      Vencido: { variant: 'error' }
    };
    const status = statusMap[estado] || { variant: 'info' as const };
    return <Badge variant={status.variant}>{estado}</Badge>;
  };

  // DataTable columns
  const columns: Column<any>[] = [
    {
      header: 'Archivador',
      id: 'archivador',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.Archivador?.nombre_archivador || '-'}</div>
          {row.original.motivo && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{row.original.motivo}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Área Solicitante',
      accessorKey: 'areaSolicitante',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.areaSolicitante?.nombre_area || '-'}
        </span>
      ),
    },
    {
      header: 'Fecha Préstamo',
      accessorKey: 'fecha_prestamo',
      sortable: true,
      align: 'center',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.fecha_prestamo).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      header: 'Devolución Esperada',
      accessorKey: 'fecha_devolucion_esperada',
      sortable: true,
      align: 'center',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.fecha_devolucion_esperada).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      align: 'center',
      cell: ({ row }) => getStatusBadge(row.original.estado),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          {canView && (
            <button
              onClick={() => navigate(`/prestamos/${row.original.id_prestamo}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver Detalle"
            >
              <IconEye size={18} />
            </button>
          )}
          {canReturn && row.original.estado === 'Activo' && (
            <button
              onClick={() => setReturnPrestamoId(row.original.id_prestamo)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Marcar como Devuelto"
            >
              <IconTransfer size={18} />
            </button>
          )}
          {canEdit && row.original.estado === 'Activo' && (
            <button
              onClick={() => navigate(`/prestamos/${row.original.id_prestamo}/editar`)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Editar"
            >
              <IconEdit size={18} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.original.id_prestamo, row.original.Archivador?.nombre_archivador || 'este préstamo')}
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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
            />
          </div>
          <div className="w-full lg:w-64">
            <SearchableSelect
              options={[
                { value: "", label: "Todos los estados" },
                { value: "Activo", label: "Activos" },
                { value: "Devuelto", label: "Devueltos" },
                { value: "Vencido", label: "Vencidos" },
              ]}
              value={filterEstado}
              onChange={(value) => {
                setFilterEstado(String(value));
                setCurrentPage(1);
              }}
              placeholder="Filtrar por estado"
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedPrestamos}
          isLoading={isLoading}
          emptyMessage={searchTerm || filterEstado ? 'No se encontraron préstamos' : 'No hay préstamos registrados'}
        />

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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletePrestamoId}
        onClose={() => {
          setDeletePrestamoId(null);
          setDeletePrestamoName('');
        }}
        onConfirm={confirmDelete}
        title="Eliminar Préstamo"
        message={`¿Estás seguro de eliminar el préstamo de "${deletePrestamoName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Return Loan Modal */}
      {returnPrestamoId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Marcar Préstamo como Devuelto</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={returnObservations}
                onChange={(e) => setReturnObservations(e.target.value)}
                placeholder="Ingrese observaciones sobre la devolución..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setReturnPrestamoId(null);
                  setReturnObservations('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => returnMutation.mutate(returnPrestamoId)}
                disabled={returnMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {returnMutation.isPending ? 'Procesando...' : 'Marcar Devuelto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PrestamosPage;
