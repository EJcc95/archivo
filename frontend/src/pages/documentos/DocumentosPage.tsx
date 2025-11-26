/**
 * Documentos Page
 * Lista y gestión de documentos con upload de archivos
 * UPDATED: Using new Badge component, improved DataTable and ConfirmModal
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconFileText,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconEye,
  IconRestore,
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination, SearchableSelect, Badge, DataTable, ConfirmModal } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { documentoService, areaService } from '@/services';
import { usePermissions } from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Documento } from '@/types/models';

const DocumentosPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterArea, setFilterArea] = useState<string | number>('');
  const [filterEstado, setFilterEstado] = useState<string | number>('');
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);
  const [deleteDocName, setDeleteDocName] = useState('');
  const itemsPerPage = 25;
  
  const canWrite = hasPermission('docs_create');
  const canEdit = hasPermission('docs_edit');
  const canDelete = hasPermission('docs_delete');

  // Fetch documentos
  const { data: documentosData, isLoading } = useQuery({
    queryKey: ['documentos'],
    queryFn: documentoService.getAll,
  });

  // Fetch areas for filtering
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  const documentos = Array.isArray(documentosData) ? documentosData : [];
  const areas = Array.isArray(areasData) ? areasData : [];

  // Options for SearchableSelect
  const areaOptions = [
    { value: '', label: 'Todas las áreas' },
    ...areas.map((area: any) => ({
      value: area.id_area,
      label: area.nombre_area,
    }))
  ];

  const estadoOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 1, label: 'Registrado' },
    { value: 2, label: 'En Proceso' },
    { value: 3, label: 'Archivado' },
    { value: 4, label: 'Prestado' },
  ];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: documentoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento eliminado',
        description: 'El documento ha sido movido a la papelera',
      });
      setDeleteDocId(null);
      setDeleteDocName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el documento',
        variant: 'destructive',
      });
      setDeleteDocId(null);
      setDeleteDocName('');
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: documentoService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento restaurado',
        description: 'El documento ha sido restaurado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo restaurar el documento',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number, nombre: string) => {
    setDeleteDocId(id);
    setDeleteDocName(nombre);
  };

  const confirmDelete = () => {
    if (deleteDocId) {
      deleteMutation.mutate(deleteDocId);
    }
  };

  const handleRestore = async (id: number) => {
    restoreMutation.mutate(id);
  };

  // Filter documentos
  const filteredDocumentos = documentos.filter((doc: Documento) => {
    const matchesSearch = 
      doc.nombre_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.asunto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeleted = showDeleted ? doc.eliminado : !doc.eliminado;
    const matchesArea = !filterArea || doc.id_area_origen === Number(filterArea);
    const matchesEstado = !filterEstado || doc.id_estado === Number(filterEstado);
    
    return matchesSearch && matchesDeleted && matchesArea && matchesEstado;
  });

  // Paginate
  const totalPages = Math.ceil(filteredDocumentos.length / itemsPerPage);
  const paginatedDocumentos = filteredDocumentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Badge helper
  const getEstadoBadge = (idEstado: number) => {
    const estados: Record<number, { label: string; variant: 'success' | 'warning' | 'info' | 'primary' }> = {
      1: { label: 'Registrado', variant: 'info' },
      2: { label: 'En Proceso', variant: 'warning' },
      3: { label: 'Archivado', variant: 'success' },
      4: { label: 'Prestado', variant: 'primary' },
    };
    const estado = estados[idEstado] || { label: 'Desconocido', variant: 'info' as const };
    return <Badge variant={estado.variant}>{estado.label}</Badge>;
  };

  // DataTable columns
  const columns: Column<any>[] = [
    {
      header: 'Documento',
      id: 'documento',
      width: 'auto',
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <div 
            className="font-medium text-gray-900 hover:text-[#032DFF] cursor-pointer"
            onClick={() => navigate(`/documentos/${row.original.id_documento}`)}
          >
            {row.original.nombre_documento}
          </div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{row.original.asunto}</div>
        </div>
      ),
    },
    {
      header: 'Área Origen',
      accessorKey: 'areaOrigen',
      sortable: true,
      width: '180px',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.areaOrigen?.nombre_area || '-'}
        </span>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'TipoDocumento',
      width: '180px',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.TipoDocumento?.nombre_tipo || '-'}
        </span>
      ),
    },
    {
      header: 'Archivador',
      accessorKey: 'Archivador',
      width: '150px',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.Archivador?.nombre_archivador || '-'}
        </span>
      ),
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha_documento',
      sortable: true,
      align: 'center',
      width: '110px',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.fecha_documento).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Folios',
      accessorKey: 'numero_folios',
      align: 'center',
      sortable: true,
      width: '80px',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">{row.original.numero_folios}</span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'id_estado',
      align: 'center',
      width: '120px',
      cell: ({ row }) => getEstadoBadge(row.original.id_estado),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      align: 'center',
      width: '140px',
      sticky: 'right',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          {!row.original.eliminado ? (
            <>
              {row.original.ruta_archivo_digital && (
                <button
                  onClick={() => navigate(`/documentos/${row.original.id_documento}`)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Ver documento"
                >
                  <IconEye size={18} />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => navigate(`/documentos/${row.original.id_documento}/editar`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <IconEdit size={18} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(row.original.id_documento, row.original.nombre_documento)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <IconTrash size={18} />
                </button>
              )}
            </>
          ) : (
            canDelete && (
              <button
                onClick={() => handleRestore(row.original.id_documento)}
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
        title="Documentos"
        description="Gestión de documentos del archivo"
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        actionButtons={canWrite ? [
          {
            label: 'Nuevo Documento',
            onClick: () => navigate('/documentos/nuevo'),
            icon: <IconPlus size={18} />,
            variant: 'primary',
          },
        ] : undefined}
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
              placeholder="Buscar por nombre o asunto..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
            />
          </div>

          <div className="w-full lg:w-64">
            <SearchableSelect
              options={areaOptions}
              value={filterArea}
              onChange={(val: string | number) => { setFilterArea(val); handleFilterChange(); }}
              placeholder="Todas las áreas"
            />
          </div>

          <div className="w-full lg:w-56">
            <SearchableSelect
              options={estadoOptions}
              value={filterEstado}
              onChange={(val: string | number) => { setFilterEstado(val); handleFilterChange(); }}
              placeholder="Todos los estados"
            />
          </div>

          {canDelete && (
            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => { setShowDeleted(e.target.checked); handleFilterChange(); }}
                className="w-4 h-4 text-[#032DFF] border-gray-300 rounded focus:ring-[#032DFF]"
              />
              Mostrar eliminados
            </label>
          )}
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedDocumentos}
          isLoading={isLoading}
          emptyMessage={searchTerm || filterArea || filterEstado ? 'No se encontraron documentos' : 'No hay documentos registrados'}
          rowClassName={(row) => row.eliminado ? 'opacity-50' : ''}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredDocumentos.length}
          />
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteDocId}
        onClose={() => {
          setDeleteDocId(null);
          setDeleteDocName('');
        }}
        onConfirm={confirmDelete}
        title="Enviar a Papelera"
        message={`¿Estás seguro de enviar a papelera "${deleteDocName}"?`}
        confirmText="Enviar a Papelera"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
};

export default DocumentosPage;
