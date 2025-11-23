/**
 * Documentos Papelera Page
 * Muestra documentos eliminados (soft delete) con opciones de restaurar
 * UPDATED: Using DataTable and Badge components
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconTrash,
  IconRestore,
  IconAlertCircle,
  IconSearch,
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination, DataTable, ConfirmModal } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { documentoService } from '@/services';
import { usePermissions } from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Documento } from '@/types/models';

const DocumentosPapeleraPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreDocId, setRestoreDocId] = useState<number | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);
  const [deleteDocName, setDeleteDocName] = useState('');
  const itemsPerPage = 25;
  
  const canDelete = hasPermission('docs_delete');

  // Fetch all documents (will filter deleted ones client-side)
  const { data: documentosData, isLoading } = useQuery({
    queryKey: ['documentos'],
    queryFn: documentoService.getAll,
  });

  const documentos = Array.isArray(documentosData) ? documentosData : [];

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: documentoService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento restaurado',
        description: 'El documento ha sido restaurado correctamente',
      });
      setRestoreDocId(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo restaurar el documento',
        variant: 'destructive',
      });
      setRestoreDocId(null);
    },
  });

  // Hard delete mutation (if backend supports it)
  const hardDeleteMutation = useMutation({
    mutationFn: documentoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento eliminado',
        description: 'El documento ha sido eliminado permanentemente',
      });
      setDeleteDocId(null);
      setDeleteDocName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el documento permanentemente',
        variant: 'destructive',
      });
      setDeleteDocId(null);
      setDeleteDocName('');
    },
  });

  const handleRestore = (id: number) => {
    setRestoreDocId(id);
  };

  const confirmRestore = () => {
    if (restoreDocId) {
      restoreMutation.mutate(restoreDocId);
    }
  };

  const handleHardDelete = (id: number, nombre: string) => {
    setDeleteDocId(id);
    setDeleteDocName(nombre);
  };

  const confirmHardDelete = () => {
    if (deleteDocId) {
      hardDeleteMutation.mutate(deleteDocId);
    }
  };

  // Filter deleted documents
  const deletedDocumentos = documentos.filter((doc: Documento) => doc.eliminado);

  // Search filter
  const filteredDocumentos = deletedDocumentos.filter((doc: Documento) =>
    doc.nombre_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.asunto.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // DataTable columns
  const columns: Column<any>[] = [
    {
      header: 'Documento',
      id: 'documento',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.nombre_documento}</div>
          <div className="text-sm text-gray-500 truncate max-w-md">{row.original.asunto}</div>
        </div>
      ),
    },
    {
      header: 'Área Origen',
      accessorKey: 'areaOrigen',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.areaOrigen?.nombre_area || '-'}
        </span>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'TipoDocumento',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.TipoDocumento?.nombre_tipo || '-'}
        </span>
      ),
    },
    {
      header: 'Fecha Eliminación',
      accessorKey: 'fecha_eliminacion',
      sortable: true,
      align: 'center',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.fecha_eliminacion ? new Date(row.original.fecha_eliminacion).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleRestore(row.original.id_documento)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Restaurar"
          >
            <IconRestore size={18} />
          </button>
          <button
            onClick={() => handleHardDelete(row.original.id_documento, row.original.nombre_documento)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar permanentemente"
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (!canDelete) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <IconAlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Acceso Denegado</h2>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a la papelera</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Papelera"
        description="Documentos eliminados - Restaurar o eliminar permanentemente"
        icon={<IconTrash size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/documentos'),
          label: 'Volver a documentos',
        }}
      />

      <div className="p-6 space-y-6">
        {/* Search */}
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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        {deletedDocumentos.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <IconAlertCircle size={20} className="text-red-600" />
              <p className="text-sm text-red-800">
                Hay <strong>{deletedDocumentos.length}</strong> documento(s) en la papelera
              </p>
            </div>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedDocumentos}
          isLoading={isLoading}
          emptyMessage={searchTerm ? 'No se encontraron documentos' : 'La papelera está vacía'}
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

      {/* Confirm Restore Modal */}
      <ConfirmModal
        isOpen={!!restoreDocId}
        onClose={() => setRestoreDocId(null)}
        onConfirm={confirmRestore}
        title="Restaurar Documento"
        message="¿Estás seguro de restaurar este documento?"
        confirmText="Restaurar"
        cancelText="Cancelar"
        confirmVariant="primary"
        isLoading={restoreMutation.isPending}
      />

      {/* Confirm Hard Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteDocId}
        onClose={() => {
          setDeleteDocId(null);
          setDeleteDocName('');
        }}
        onConfirm={confirmHardDelete}
        title="Eliminar Permanentemente"
        message={`¿Estás seguro de eliminar PERMANENTEMENTE "${deleteDocName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={hardDeleteMutation.isPending}
      />
    </PageContainer>
  );
};

export default DocumentosPapeleraPage;
