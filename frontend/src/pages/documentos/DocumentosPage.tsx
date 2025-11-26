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
import { PageContainer, PageHeader, SearchableSelect, Badge, DataTable, ConfirmModal } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { documentoService, areaService, tipoDocumentoService } from '@/services';
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
  const [filterArea, setFilterArea] = useState<string | number>('');
  const [filterEstado, setFilterEstado] = useState<string | number>('');
  const [filterTipoDocumento, setFilterTipoDocumento] = useState<string | number>('');
  const [filterAnio, setFilterAnio] = useState<string | number>('');
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);
  const [deleteDocName, setDeleteDocName] = useState('');
  
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

  // Fetch tipos de documento for filtering
  const { data: tiposDocumentoData } = useQuery({
    queryKey: ['tipos-documento'],
    queryFn: tipoDocumentoService.getAll,
  });

  const documentos = Array.isArray(documentosData) ? documentosData : [];
  const areas = Array.isArray(areasData) ? areasData : [];
  const tiposDocumento = Array.isArray(tiposDocumentoData) ? tiposDocumentoData : [];

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

  const tipoDocumentoOptions = [
    { value: '', label: 'Todos los tipos' },
    ...tiposDocumento.map((tipo: any) => ({
      value: tipo.id_tipo_documento,
      label: tipo.nombre_tipo,
    }))
  ];

  // Extract unique years from documents
  const aniosDisponibles = [...new Set(
    documentos.map((doc: any) => new Date(doc.fecha_documento).getFullYear())
  )].sort((a, b) => b - a);

  const anioOptions = [
    { value: '', label: 'Todos los años' },
    ...aniosDisponibles.map(anio => ({ value: anio, label: anio.toString() }))
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
    const matchesTipoDocumento = !filterTipoDocumento || doc.id_tipo_documento === Number(filterTipoDocumento);
    const matchesAnio = !filterAnio || new Date(doc.fecha_documento).getFullYear() === Number(filterAnio);
    
    return matchesSearch && matchesDeleted && matchesArea && matchesEstado && matchesTipoDocumento && matchesAnio;
  });

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
        <div className="flex flex-col gap-3">
          {/* First Row: Search + Area Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por nombre o asunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-64">
              <SearchableSelect
                options={areaOptions}
                value={filterArea}
                onChange={(val: string | number) => setFilterArea(val)}
                placeholder="Todas las áreas"
              />
            </div>
          </div>

          {/* Second Row: Other Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[180px] sm:max-w-[220px]">
              <SearchableSelect
                options={estadoOptions}
                value={filterEstado}
                onChange={(val: string | number) => setFilterEstado(val)}
                placeholder="Todos los estados"
              />
            </div>

            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-[240px]">
              <SearchableSelect
                options={tipoDocumentoOptions}
                value={filterTipoDocumento}
                onChange={(val: string | number) => setFilterTipoDocumento(val)}
                placeholder="Todos los tipos"
              />
            </div>

            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[180px] sm:max-w-[200px]">
              <SearchableSelect
                options={anioOptions}
                value={filterAnio}
                onChange={(val: string | number) => setFilterAnio(val)}
                placeholder="Todos los años"
              />
            </div>

            {canDelete && (
              <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap cursor-pointer hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="w-4 h-4 text-[#032DFF] border-gray-300 rounded focus:ring-[#032DFF] cursor-pointer"
                />
                Mostrar eliminados
              </label>
            )}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredDocumentos}
          isLoading={isLoading}
          emptyMessage={searchTerm || filterArea || filterEstado || filterTipoDocumento || filterAnio ? 'No se encontraron documentos con los filtros seleccionados' : 'No hay documentos registrados'}
          rowClassName={(row) => row.eliminado ? 'opacity-50' : ''}
          pageSize={10}
        />
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
