/**
 * Documentos Page
 * Lista y gestión de documentos con upload de archivos
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
import { PageContainer, PageHeader, Pagination } from '@/components/ui';
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
  const [filterArea, setFilterArea] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: documentoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento eliminado',
        description: 'El documento ha sido movido a la papelera',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el documento',
        variant: 'destructive',
      });
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

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de enviar a papelera "${nombre}"?`)) {
      deleteMutation.mutate(id);
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

  const getEstadoBadge = (idEstado: number) => {
    const estados: Record<number, { label: string; class: string }> = {
      1: { label: 'Registrado', class: 'bg-blue-100 text-blue-800' },
      2: { label: 'En Proceso', class: 'bg-yellow-100 text-yellow-800' },
      3: { label: 'Archivado', class: 'bg-green-100 text-green-800' },
      4: { label: 'Prestado', class: 'bg-purple-100 text-purple-800' },
    };
    const estado = estados[idEstado] || { label: 'Desconocido', class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.class}`}>
        {estado.label}
      </span>
    );
  };

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
        <div className="flex flex-col sm:flex-row gap-4">
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterArea}
            onChange={(e) => { setFilterArea(e.target.value); handleFilterChange(); }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las áreas</option>
            {areas.map((area: any) => (
              <option key={area.id_area} value={area.id_area}>
                {area.nombre_area}
              </option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => { setFilterEstado(e.target.value); handleFilterChange(); }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="1">Registrado</option>
            <option value="2">En Proceso</option>
            <option value="3">Archivado</option>
            <option value="4">Prestado</option>
          </select>

          {canDelete && (
            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => { setShowDeleted(e.target.checked); handleFilterChange(); }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Mostrar eliminados
            </label>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedDocumentos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || filterArea || filterEstado ? 'No se encontraron documentos' : 'No hay documentos registrados'}
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folios
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
                {paginatedDocumentos.map((doc: Documento) => (
                  <tr key={doc.id_documento} className={`hover:bg-gray-50 ${doc.eliminado ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div 
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => navigate(`/documentos/${doc.id_documento}`)}
                      >
                        {doc.nombre_documento}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{doc.asunto}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {doc.areaOrigen?.nombre_area || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {new Date(doc.fecha_documento).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{doc.numero_folios}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getEstadoBadge(doc.id_estado)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!doc.eliminado ? (
                          <>
                            {doc.ruta_archivo_digital && (
                              <button
                                onClick={() => navigate(`/documentos/${doc.id_documento}`)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Ver documento"
                              >
                                <IconEye size={18} />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => navigate(`/documentos/${doc.id_documento}/editar`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <IconEdit size={18} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(doc.id_documento, doc.nombre_documento)}
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
                              onClick={() => handleRestore(doc.id_documento)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restaurar"
                            >
                              <IconRestore size={18} />
                            </button>
                          )
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
            totalItems={filteredDocumentos.length}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default DocumentosPage;
