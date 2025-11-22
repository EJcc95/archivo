/**
 * Documento Detalle Page
 * Muestra los detalles del documento y visualizador de PDF
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  IconFileText,
  IconEdit,
  IconDownload,
  IconCalendar,
  IconFolder,
  IconArchive,
  IconEye,
  IconFileDescription,
} from '@tabler/icons-react';
import { PageContainer, PageHeader } from '@/components/ui';
import { documentoService } from '@/services';
import { usePermissions } from '@/hooks';

const DocumentoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('docs_edit');

  const { data: documento, isLoading } = useQuery({
    queryKey: ['documento', id],
    queryFn: () => documentoService.getById(Number(id)),
    enabled: !!id,
  });

  const getEstadoBadge = (idEstado: number) => {
    const estados: Record<number, { label: string; class: string }> = {
      1: { label: 'Registrado', class: 'bg-blue-100 text-blue-800' },
      2: { label: 'En Proceso', class: 'bg-yellow-100 text-yellow-800' },
      3: { label: 'Archivado', class: 'bg-green-100 text-green-800' },
      4: { label: 'Prestado', class: 'bg-purple-100 text-purple-800' },
    };
    const estado = estados[idEstado] || { label: 'Desconocido', class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${estado.class}`}>
        {estado.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!documento) {
    return (
      <PageContainer>
        <div className="p-6 text-center text-gray-500">
          Documento no encontrado
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={documento.nombre_documento}
        description="Detalles del documento"
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/documentos'),
          label: 'Volver a documentos',
        }}
        actionButtons={canEdit ? [
          {
            label: 'Editar',
            onClick: () => navigate(`/documentos/${id}/editar`),
            icon: <IconEdit size={18} />,
            variant: 'secondary',
          },
        ] : undefined}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Documento */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card: Información General */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconFileDescription size={20} />
                Información General
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1">{getEstadoBadge(documento.id_estado)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Asunto</dt>
                  <dd className="mt-1 text-sm text-gray-900">{documento.asunto}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <IconCalendar size={16} />
                    Fecha del Documento
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(documento.fecha_documento).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Número de Folios</dt>
                  <dd className="mt-1 text-sm text-gray-900">{documento.numero_folios}</dd>
                </div>
              </dl>
            </div>

            {/* Card: Ubicación */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconFolder size={20} />
                Ubicación
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Área de Origen</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {documento.areaOrigen?.nombre_area || '-'}
                  </dd>
                </div>
                {documento.areaDestino && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Área de Destino</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {documento.areaDestino?.nombre_area}
                    </dd>
                  </div>
                )}
                {documento.archivador && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <IconArchive size={16} />
                      Archivador
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {documento.archivador?.nombre_archivador}
                      {documento.archivador?.ubicacion_fisica && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {documento.archivador.ubicacion_fisica}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Card: Estadísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconEye size={20} />
                Estadísticas
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Consultas</dt>
                  <dd className="mt-1 text-sm text-gray-900">{documento.numero_consultas || 0} veces</dd>
                </div>
                {documento.fecha_ultima_consulta && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Última Consulta</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(documento.fecha_ultima_consulta).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(documento.fecha_registro_sistema).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {documento.observaciones && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
                <p className="text-sm text-gray-700">{documento.observaciones}</p>
              </div>
            )}
          </div>

          {/* Visualizador de PDF */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Documento Digital</h3>
                {documento.ruta_archivo_digital && (
                  <button
                    onClick={async () => {
                      try {
                        const blob = await documentoService.download(documento.id_documento);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${documento.nombre_documento}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading:', error);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <IconDownload size={16} />
                    Descargar PDF
                  </button>
                )}
              </div>

              {documento.ruta_archivo_digital ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <iframe
                    src={documentoService.getViewUrl(documento.id_documento)}
                    className="w-full h-[800px]"
                    title={documento.nombre_documento}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <IconFileText size={64} className="mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay archivo digital disponible</p>
                  <p className="text-sm mt-2">Este documento no tiene un archivo PDF adjunto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DocumentoDetallePage;
