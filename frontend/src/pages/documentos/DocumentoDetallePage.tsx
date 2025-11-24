/**
 * Documento Detalle Page
 * Muestra los detalles del documento y visualizador de PDF
 * UPDATED: Improved design with Card, Badge components and better visual hierarchy
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
  IconFileDescription,
  IconHash,
  IconClock,
} from '@tabler/icons-react';
import { PageContainer, PageHeader, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { documentoService } from '@/services';
import { usePermissions } from '@/hooks';
import toast from 'react-hot-toast';

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
    const estados: Record<number, { label: string; variant: 'success' | 'warning' | 'info' | 'primary' }> = {
      1: { label: 'Registrado', variant: 'info' },
      2: { label: 'En Proceso', variant: 'warning' },
      3: { label: 'Archivado', variant: 'success' },
      4: { label: 'Prestado', variant: 'primary' },
    };
    const estado = estados[idEstado] || { label: 'Desconocido', variant: 'info' as const };
    return <Badge variant={estado.variant}>{estado.label}</Badge>;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032DFF]"></div>
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
            <Card>
              <CardHeader
                title="Información General"
                subtitle="Datos principales del documento"
              />
              <CardBody>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5">Estado</dt>
                    <dd>{getEstadoBadge(documento.id_estado)}</dd>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5">Asunto</dt>
                    <dd className="text-sm text-gray-900">{documento.asunto}</dd>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <IconCalendar size={14} />
                        Fecha
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(documento.fecha_documento).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <IconHash size={14} />
                        Folios
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">{documento.numero_folios}</dd>
                    </div>
                  </div>
                </dl>
              </CardBody>
            </Card>

            {/* Card: Ubicación */}
            <Card>
              <CardHeader title="Ubicación y Clasificación" />
              <CardBody>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                      <IconFolder size={14} />
                      Área de Origen
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {documento.areaOrigen?.nombre_area || '-'}
                    </dd>
                  </div>
                  
                  {documento.areaDestino && (
                    <div className="border-t border-gray-100 pt-4">
                      <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5">
                        Área de Destino
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {documento.areaDestino?.nombre_area}
                      </dd>
                    </div>
                  )}
                  
                  {documento.TipoDocumento && (
                    <div className="border-t border-gray-100 pt-4">
                      <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5">
                        Tipo de Documento
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {documento.TipoDocumento?.nombre_tipo}
                      </dd>
                    </div>
                  )}
                  
                  {documento.Archivador && (
                    <div className="border-t border-gray-100 pt-4">
                      <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <IconArchive size={14} />
                        Archivador
                      </dt>
                      <dd>
                        <div className="text-sm font-medium text-gray-900">
                          {documento.Archivador?.nombre_archivador}
                        </div>
                        {documento.Archivador?.ubicacion_fisica && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            📍 {documento.Archivador.ubicacion_fisica}
                          </div>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>

            {/* Card: Estadísticas */}
            <Card>
              <CardHeader
                title="Estadísticas"
                subtitle="Historial de consultas"
              />
              <CardBody>
                <dl className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Total de Consultas
                    </dt>
                    <dd className="text-2xl font-bold text-[#032DFF]">
                      {documento.numero_consultas || 0}
                    </dd>
                  </div>
                  
                  {documento.fecha_ultima_consulta && (
                    <div className="border-t border-gray-100 pt-4">
                      <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <IconClock size={14} />
                        Última Consulta
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(documento.fecha_ultima_consulta).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100 pt-4">
                    <dt className="text-xs font-medium text-gray-500 uppercase mb-1.5">
                      Fecha de Registro
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(documento.fecha_registro_sistema).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>

            {documento.observaciones && (
              <Card>
                <CardHeader title="Observaciones" />
                <CardBody>
                  <p className="text-sm text-gray-700 leading-relaxed">{documento.observaciones}</p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Visualizador de PDF */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconFileDescription size={20} className="text-gray-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Documento Digital</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {documento.ruta_archivo_digital ? 'Vista previa del archivo PDF' : 'Sin archivo adjunto'}
                      </p>
                    </div>
                  </div>
                  {documento.ruta_archivo_digital && (
                    <button
                        onClick={async () => {
                          const toastId = toast.loading('Iniciando descarga...');
                          try {
                            const blob = await documentoService.download(documento.id_documento, (progressEvent) => {
                              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                              toast.loading(`Descargando: ${percentCompleted}%`, { id: toastId });
                            });
                            
                            toast.success('Descarga completada', { id: toastId });
                            
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
                            toast.error('Error al descargar el documento', { id: toastId });
                          }
                        }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#032DFF] text-white text-sm rounded-lg hover:bg-[#0225cc] transition-colors"
                    >
                      <IconDownload size={16} />
                      Descargar PDF
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardBody className="p-0">
                {documento.ruta_archivo_digital ? (
                  <div className="border-t border-gray-200">
                    <iframe
                      src={documentoService.getViewUrl(documento.id_documento)}
                      className="w-full h-[800px]"
                      title={documento.nombre_documento}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="p-6 bg-gray-50 rounded-full mb-4">
                      <IconFileText size={64} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">No hay archivo digital disponible</p>
                    <p className="text-sm text-gray-500 mt-2">Este documento no tiene un archivo PDF adjunto</p>
                    {canEdit && (
                      <button
                        onClick={() => navigate(`/documentos/${id}/editar`)}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm text-[#032DFF] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <IconEdit size={16} />
                        Editar y adjuntar archivo
                      </button>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DocumentoDetallePage;
