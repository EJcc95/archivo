/**
 * Editar Documento Page
 * Formulario para editar un documento existente
 * UPDATED: Using FormField, Card, and SearchableSelect components
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy, IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { PageContainer, PageHeader, FormField, Card, CardHeader, CardBody, SearchableSelect, UploadProgressModal } from '@/components/ui';
import { documentoService, areaService, archivadorService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const DocumentoEditarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_documento: '',
    asunto: '',
    fecha_documento: '',
    numero_folios: 1,
    observaciones: '',
    id_tipo_documento: 1,
    id_area_origen: 0,
    id_area_destino: 0,
    destinatario_externo: '',
    id_archivador: 0,
    id_estado: 1,
  });

  const [newFile, setNewFile] = useState<File | null>(null);
  const [updateFile, setUpdateFile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Fetch documento
  const { data: documento, isLoading } = useQuery({
    queryKey: ['documento', id],
    queryFn: () => documentoService.getById(Number(id)),
    enabled: !!id,
  });

  // Fetch areas
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  // Fetch archivadores
  const { data: archivadoresData } = useQuery({
    queryKey: ['archivadores'],
    queryFn: archivadorService.getAll,
  });

  const areas = Array.isArray(areasData) ? areasData : [];
  const archivadores = Array.isArray(archivadoresData) ? archivadoresData : [];

  // Prepare options for SearchableSelect
  const areaOptions = areas.map((area: any) => ({
    value: area.id_area,
    label: area.nombre_area,
  }));

  const archivadorOptions = archivadores
    .filter((arch: any) => 
      (!formData.id_area_origen || arch.id_area_propietaria === Number(formData.id_area_origen)) &&
      !arch.eliminado
    )
    .map((arch: any) => ({
      value: arch.id_archivador,
      label: `${arch.nombre_archivador} - ${arch.areaPropietaria?.nombre_area}`,
      description: `Ocupado: ${arch.total_folios} folios`,
    }));

  // Populate form when data loads
  useEffect(() => {
    if (documento) {
      setFormData({
        nombre_documento: documento.nombre_documento || '',
        asunto: documento.asunto || '',
        fecha_documento: documento.fecha_documento || '',
        numero_folios: documento.numero_folios || 1,
        observaciones: documento.observaciones || '',
        id_tipo_documento: documento.id_tipo_documento || 1,
        id_area_origen: documento.id_area_origen || 0,
        id_area_destino: documento.id_area_destino || 0,
        destinatario_externo: documento.destinatario_externo || '',
        id_archivador: documento.id_archivador || 0,
        id_estado: documento.id_estado || 1,
      });
    }
  }, [documento]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      // Check if we are uploading a file (FormData)
      if (data instanceof FormData) {
        setShowProgressModal(true);
        setUploadProgress(0);
        return documentoService.update(Number(id), data, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });
      }
      return documentoService.update(Number(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['documento', id] });
      toast({
        title: 'Documento actualizado',
        description: 'El documento ha sido actualizado correctamente',
      });
      navigate('/documentos');
    },
    onSettled: () => {
      setShowProgressModal(false);
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el documento',
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_documento.trim()) {
      newErrors.nombre_documento = 'El nombre del documento es requerido';
    }
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es requerido';
    }
    if (!formData.id_area_origen) {
      newErrors.id_area_origen = 'Debe seleccionar el área de origen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Errores de validación',
        description: 'Por favor corrija los errores antes de continuar',
        variant: 'destructive',
      });
      return;
    }

    // Preparar datos excluyendo campos opcionales vacíos
    const dataToSend: any = {
      nombre_documento: formData.nombre_documento,
      asunto: formData.asunto,
      fecha_documento: formData.fecha_documento,
      numero_folios: formData.numero_folios,
      id_tipo_documento: formData.id_tipo_documento,
      id_area_origen: formData.id_area_origen,
      id_estado: formData.id_estado,
    };

    // Solo incluir campos opcionales si tienen valores válidos
    if (formData.observaciones) dataToSend.observaciones = formData.observaciones;
    if (formData.id_area_destino && formData.id_area_destino > 0) dataToSend.id_area_destino = formData.id_area_destino;
    if (formData.destinatario_externo) dataToSend.destinatario_externo = formData.destinatario_externo;
    if (formData.id_archivador && formData.id_archivador > 0) dataToSend.id_archivador = formData.id_archivador;

    // Si hay nuevo archivo, usar FormData
    if (newFile) {
      const data = new FormData();
      for (const [key, value] of Object.entries(dataToSend)) {
        data.append(key, String(value));
      }
      data.append('archivo', newFile);
      updateMutation.mutate(data);
    } else {
      updateMutation.mutate(dataToSend);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Error',
          description: 'Solo se permiten archivos PDF',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      if (file.size > 400 * 1024 * 1024) { // 400MB
        toast({
          title: 'Error',
          description: 'El archivo no debe exceder 400MB',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      setNewFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['id_tipo_documento', 'id_area_origen', 'id_area_destino', 'id_archivador', 'id_estado', 'numero_folios'].includes(name)
        ? Number(value)
        : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
        title="Editar Documento"
        description={`Modificar información de ${documento.nombre_documento}`}
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/documentos'),
          label: 'Volver a documentos',
        }}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Grid - Left Content and Right Metadata */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Main Content (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Información Básica */}
                <Card>
                  <CardHeader
                    title="Información Básica"
                    subtitle="Datos principales del documento"
                  />
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Área Origen */}
                      <FormField
                        label="Área de Origen"
                        required
                        error={errors.id_area_origen}
                      >
                        <SearchableSelect
                          options={areaOptions}
                          value={formData.id_area_origen}
                          onChange={(value) => {
                            setFormData((prev) => ({ ...prev, id_area_origen: Number(value) }));
                            if (errors.id_area_origen) {
                              setErrors((prev) => ({ ...prev, id_area_origen: '' }));
                            }
                          }}
                          placeholder="Seleccione área"
                          error={!!errors.id_area_origen}
                        />
                      </FormField>

                      {/* Archivador */}
                      <FormField label="Archivador">
                        <SearchableSelect
                          options={archivadorOptions}
                          value={formData.id_archivador}
                          onChange={(value) => {
                            const numValue = Number(value);
                            // Obtener el archivador seleccionado
                            const selectedArchivador = archivadores.find((arch: any) => arch.id_archivador === numValue);
                            // Si tiene tipo de documento, asignarlo automáticamente
                            const tipoDocId = selectedArchivador?.id_tipo_documento_contenido || 1;
                            
                            setFormData((prev) => ({ 
                              ...prev, 
                              id_archivador: numValue,
                              id_tipo_documento: tipoDocId
                            }));
                          }}
                          placeholder="Seleccione archivador"
                          emptyMessage={formData.id_area_origen ? "No hay archivadores disponibles" : "Seleccione primero un área"}
                        />
                      </FormField>

                      {/* Nombre */}
                      <FormField
                        label="Nombre del Documento"
                        required
                        error={errors.nombre_documento}
                        htmlFor="nombre_documento"
                      >
                        <input
                          type="text"
                          id="nombre_documento"
                          name="nombre_documento"
                          value={formData.nombre_documento}
                          onChange={handleChange}
                          maxLength={100}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                        />
                      </FormField>

                      {/* Fecha */}
                      <FormField
                        label="Fecha del Documento"
                        required
                        htmlFor="fecha_documento"
                      >
                        <input
                          type="date"
                          id="fecha_documento"
                          name="fecha_documento"
                          value={formData.fecha_documento}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                        />
                      </FormField>

                      {/* Número de Folios */}
                      <FormField
                        label="Número de Folios"
                        required
                        htmlFor="numero_folios"
                      >
                        <input
                          type="text"
                          id="numero_folios"
                          name="numero_folios"
                          value={formData.numero_folios}
                          onChange={(e) => {
                            const value = e.target.value.trim();
                            if (value === '' || /^\d+$/.test(value)) {
                              const numValue = value === '' ? 1 : parseInt(value, 10);
                              setFormData((prev) => ({ ...prev, numero_folios: numValue }));
                              if (errors.numero_folios) {
                                setErrors((prev) => ({ ...prev, numero_folios: '' }));
                              }
                            }
                          }}
                          placeholder="Ej: 200"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                        />
                      </FormField>

                      {/* Estado */}
                      <FormField label="Estado del Documento">
                        <select
                          id="id_estado"
                          name="id_estado"
                          value={formData.id_estado}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                        >
                          <option value="1">Registrado</option>
                          <option value="2">En Proceso</option>
                          <option value="3">Archivado</option>
                          <option value="4">Prestado</option>
                        </select>
                      </FormField>
                    </div>

                    {/* Asunto */}
                    <FormField
                      label="Asunto"
                      required
                      error={errors.asunto}
                      htmlFor="asunto"
                      className="mt-6"
                    >
                      <textarea
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                      />
                    </FormField>
                  </CardBody>
                </Card>
              </div>

              {/* Right Column - Metadata (1/3) */}
              <div className="space-y-6">
                {/* Archivo Digital */}
                <Card className="border-blue-100 shadow-lg overflow-hidden">
                  <CardHeader
                    title="Archivo Digital"
                    subtitle={documento.ruta_archivo_digital ? "Actualizar documento PDF (Máx. 400MB)" : "Adjunte el documento PDF (Máx. 400MB)"}
                  />
                  <CardBody>
                    {documento.ruta_archivo_digital && !updateFile && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="shrink-0">
                            <IconCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-900">
                              Archivo actual
                            </p>
                            <p className="text-xs text-green-700 mt-0.5 truncate">
                              {documento.ruta_archivo_digital.split('/').pop()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUpdateFile(true);
                            setNewFile(null);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-blue-300 text-[#032DFF] rounded-lg hover:bg-blue-50 font-medium transition-all duration-200 text-sm"
                        >
                          <IconUpload size={18} />
                          Cambiar Archivo
                        </button>
                      </div>
                    )}

                    {(updateFile || !documento.ruta_archivo_digital) && (
                      <label
                        htmlFor="archivo"
                        className="block cursor-pointer group"
                      >
                        <div className="relative flex flex-col items-center justify-center px-6 py-12 border-2 border-blue-200 border-dashed rounded-xl hover:border-[#032DFF] hover:bg-linear-to-b hover:from-blue-50 hover:to-blue-50/50 transition-all duration-300">
                          {/* Background gradient on hover */}
                          <div className="absolute inset-0 bg-linear-to-b from-[#032DFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                          
                          {/* Content */}
                          <div className="relative space-y-3 text-center">
                            <div className="mx-auto h-20 w-20 bg-linear-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-200 group-hover:scale-110 transition-all duration-300">
                              <IconUpload className="h-9 w-9 text-[#032DFF] group-hover:scale-120 transition-transform" />
                            </div>
                            
                            <div>
                              <p className="text-sm font-semibold text-gray-700 group-hover:text-[#032DFF] transition-colors">
                                Subir archivo PDF
                              </p>
                              <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors mt-1">
                                Arrastrar y soltar o hacer clic
                              </p>
                            </div>

                            {newFile && (
                              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200 shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="truncate max-w-[180px]">{newFile.name}</span>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-400 pt-1">
                              PDF • Máximo 400MB
                            </p>
                          </div>
                        </div>
                        <input
                          id="archivo"
                          name="archivo"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    )}

                    {updateFile && documento.ruta_archivo_digital && (
                      <button
                        type="button"
                        onClick={() => {
                          setUpdateFile(false);
                          setNewFile(null);
                        }}
                        className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:bg-gray-50 font-medium transition-all duration-200 text-sm"
                      >
                        <IconX size={18} />
                        Cancelar cambio
                      </button>
                    )}
                  </CardBody>
                </Card>

                {/* Actions Card */}
                <Card className="border-blue-200 bg-linear-to-br from-white to-blue-50/30">
                  <CardBody className="space-y-3">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-[#032DFF] to-[#0225cc] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 text-sm"
                    >
                      <IconDeviceFloppy size={18} />
                      {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/documentos')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg hover:border-gray-300 hover:bg-gray-50 font-medium transition-all duration-200 text-sm"
                    >
                      <IconArrowLeft size={18} />
                      Cancelar
                    </button>
                  </CardBody>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>


      <UploadProgressModal
        isOpen={showProgressModal}
        progress={uploadProgress}
        fileName={newFile?.name}
        title="Actualizando documento"
      />
    </PageContainer>
  );
};

export default DocumentoEditarPage;
