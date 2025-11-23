/**
 * Documentos Huérfanos Page
 * Muestra documentos sin archivador asignado con opción de asignarles uno
 * UPDATED: Using DataTable, Badge, and improved modal design
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
import { PageContainer, PageHeader, Pagination, SearchableSelect, DataTable, Badge, Card, CardHeader, CardBody, CardFooter, FormField } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
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
        label: `${arch.nombre_archivador}`,
        description: `${arch.total_folios} folios - ${arch.estado}`,
      }));
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
      header: 'Folios',
      accessorKey: 'numero_folios',
      align: 'center',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">{row.original.numero_folios}</span>
      ),
    },
    {
      header: 'Estado',
      id: 'estado',
      align: 'center',
      cell: () => (
        <Badge variant="warning">Sin archivador</Badge>
      ),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      align: 'center',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedDocumento(row.original)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        >
          <IconFolderPlus size={16} />
          Asignar
        </button>
      ),
    },
  ];

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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        {orphanedDocumentos.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <IconAlertCircle size={20} className="text-orange-600" />
              <p className="text-sm text-orange-800">
                Hay <strong>{orphanedDocumentos.length}</strong> documento(s) sin archivador asignado
              </p>
            </div>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedDocumentos}
          isLoading={isLoading}
          emptyMessage={searchTerm ? 'No se encontraron documentos' : 'No hay documentos sin archivador'}
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

      {/* Modal para asignar archivador */}
      {selectedDocumento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <Card padding="none">
              <CardHeader>
                <div className="flex justify-between items-center px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Asignar Archivador
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedDocumento(null);
                      setSelectedArchivador('');
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <IconX size={20} />
                  </button>
                </div>
              </CardHeader>
              
              <CardBody className="px-6 py-4 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Documento</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedDocumento.nombre_documento}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Tipo</p>
                      <p className="text-sm text-gray-700 mt-0.5">{selectedDocumento.TipoDocumento?.nombre_tipo}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Área</p>
                      <p className="text-sm text-gray-700 mt-0.5">{selectedDocumento.areaOrigen?.nombre_area}</p>
                    </div>
                  </div>
                </div>

                <FormField
                  label="Seleccionar Archivador"
                  required
                  help="Solo se muestran archivadores compatibles con el tipo de documento, área y que estén abiertos"
                >
                  <SearchableSelect
                    options={getAvailableArchivadores(selectedDocumento)}
                    value={selectedArchivador}
                    onChange={setSelectedArchivador}
                    placeholder="Buscar archivador compatible..."
                    emptyMessage="No hay archivadores compatibles disponibles"
                  />
                </FormField>
              </CardBody>

              <CardFooter>
                <div className="flex justify-end gap-3 px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedDocumento(null);
                      setSelectedArchivador('');
                    }}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssignArchivador}
                    disabled={!selectedArchivador || updateMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {updateMutation.isPending ? 'Asignando...' : 'Asignar Archivador'}
                  </button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DocumentosHuerfanosPage;
