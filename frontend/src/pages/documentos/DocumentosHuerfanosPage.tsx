/**
 * Documentos Huérfanos Page
 * Muestra documentos sin archivador asignado con opción de asignarles uno
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconAlertCircle,
  IconSearch,
  IconFolderPlus,
  IconX,
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination, SearchableSelect } from '@/components/ui';
import { documentoService, archivadorService } from '@/services';
import { usePermissions } from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Documento } from '@/types/models';

const DocumentosHuerfanosPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocumento, setSelectedDocumento] = useState<any>(null);
  const [selectedArchivador, setSelectedArchivador] = useState<number | string>('');
  const itemsPerPage = 25;
  
  const canEdit = hasPermission('docs_edit');

  // Fetch all documents
  const { data: documentosData, isLoading } = useQuery({
    queryKey: ['documentos'],
    queryFn: documentoService.getAll,
  });

  // Fetch archivadores
  const { data: archivadoresData } = useQuery({
    queryKey: ['archivadores'],
    queryFn: archivadorService.getAll,
  });

  const documentos = Array.isArray(documentosData) ? documentosData : [];
  const archivadores = Array.isArray(archivadoresData) ? archivadoresData : [];

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => documentoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Archivador asignado',
        description: 'El documento ha sido asignado a un archivador correctamente',
      });
      setSelectedDocumento(null);
      setSelectedArchivador('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo asignar el archivador',
        variant: 'destructive',
      });
    },
  });

  const handleAssignArchivador = () => {
    if (!selectedDocumento || !selectedArchivador) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un archivador',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate({
      id: selectedDocumento.id_documento,
      data: {
        id_archivador: Number(selectedArchivador),
      },
    });
  };

  // Filter orphaned documents (no archivador and not deleted)
  const orphanedDocumentos = documentos.filter(
    (doc: Documento) => !doc.id_archivador && !doc.eliminado
  );

  // Search filter
  const filteredDocumentos = orphanedDocumentos.filter((doc: Documento) =>
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

  // Get archivadores filtered by document type and area
  const getAvailableArchivadores = (documento: any) => {
    return archivadores
      .filter((arch: any) => 
        arch.id_tipo_documento_contenido === documento.id_tipo_documento &&
        arch.id_area_propietaria === documento.id_area_origen &&
        arch.estado === 'Abierto' &&
        !arch.eliminado
      )
      .map((arch: any) => ({
        value: arch.id_archivador,
        label: `${arch.nombre_archivador} (${arch.total_folios} folios)`,
      }));
  };

  if (!canEdit) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <IconAlertCircle size={48} className="mx-auto text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Acceso Denegado</h2>
            <p className="text-gray-600 mt-2">No tienes permisos para gestionar archivadores</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Documentos Sin Archivador"
        description="Documentos que no tienen archivador asignado"
        icon={<IconAlertCircle size={28} className="text-white" strokeWidth={2} />}
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
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent h-[42px]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <IconAlertCircle size={20} className="text-orange-600" />
            <p className="text-sm text-orange-800">
              Hay <strong>{orphanedDocumentos.length}</strong> documento(s) sin archivador asignado
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : paginatedDocumentos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No se encontraron documentos' : 'No hay documentos sin archivador'}
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
                    Folios
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
                      <span className="text-sm font-medium text-gray-900">{doc.numero_folios}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedDocumento(doc)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Asignar archivador"
                      >
                        <IconFolderPlus size={18} />
                        Asignar
                      </button>
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

      {/* Modal para asignar archivador */}
      {selectedDocumento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Asignar Archivador
              </h3>
              <button
                onClick={() => {
                  setSelectedDocumento(null);
                  setSelectedArchivador('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconX size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Documento:</p>
                <p className="text-sm text-gray-900">{selectedDocumento.nombre_documento}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Tipo:</p>
                <p className="text-sm text-gray-600">{selectedDocumento.TipoDocumento?.nombre_tipo}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Área:</p>
                <p className="text-sm text-gray-600">{selectedDocumento.areaOrigen?.nombre_area}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Archivador *
                </label>
                <SearchableSelect
                  options={getAvailableArchivadores(selectedDocumento)}
                  value={selectedArchivador}
                  onChange={setSelectedArchivador}
                  placeholder="Seleccione un archivador"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo se muestran archivadores compatibles con el tipo de documento y área
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedDocumento(null);
                  setSelectedArchivador('');
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignArchivador}
                disabled={!selectedArchivador || updateMutation.isPending}
                className="px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {updateMutation.isPending ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DocumentosHuerfanosPage;
