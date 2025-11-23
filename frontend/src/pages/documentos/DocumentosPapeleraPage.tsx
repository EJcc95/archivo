/**
 * Documentos Papelera Page
 * Muestra documentos eliminados (soft delete) con opciones de restaurar o eliminar permanentemente
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
import { PageContainer, PageHeader, Pagination } from '@/components/ui';
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
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo restaurar el documento',
        variant: 'destructive',
      });
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
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el documento permanentemente',
        variant: 'destructive',
      });
    },
  });

  const handleRestore = async (id: number) => {
    if (window.confirm('¿Estás seguro de restaurar este documento?')) {
      restoreMutation.mutate(id);
    }
  };

  const handleHardDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar PERMANENTEMENTE "${nombre}"? Esta acción no se puede deshacer.`)) {
      hardDeleteMutation.mutate(id);
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
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-[42px]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <IconAlertCircle size={20} className="text-red-600" />
            <p className="text-sm text-red-800">
              Hay <strong>{deletedDocumentos.length}</strong> documento(s) en la papelera
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : paginatedDocumentos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No se encontraron documentos' : 'La papelera está vacía'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Eliminación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDocumentos.map((doc: any) => (
                  <tr key={doc.id_documento} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{doc.nombre_documento}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{doc.asunto}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {doc.areaOrigen?.nombre_area || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {doc.TipoDocumento?.nombre_tipo || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {doc.fecha_eliminacion ? new Date(doc.fecha_eliminacion).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(doc.id_documento)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restaurar"
                        >
                          <IconRestore size={18} />
                        </button>
                        <button
                          onClick={() => handleHardDelete(doc.id_documento, doc.nombre_documento)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar permanentemente"
                        >
                          <IconTrash size={18} />
                        </button>
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
            totalItems={filteredDocumentos.length}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default DocumentosPapeleraPage;
