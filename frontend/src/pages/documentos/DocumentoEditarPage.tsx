/**
 * Editar Documento Page
 * Formulario para editar un documento existente
 * UPDATED: Using FormField, Card, and SearchableSelect components
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy, IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { PageContainer, PageHeader, FormField, Card, CardHeader, CardBody, CardFooter, SearchableSelect } from '@/components/ui';
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
      (!formData.id_tipo_documento || arch.id_tipo_documento_contenido === Number(formData.id_tipo_documento)) &&
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
    mutationFn: (data: any) => documentoService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['documento', id] });
      toast({
        title: 'Documento actualizado',
        description: 'El documento ha sido actualizado correctamente',
      });
      navigate('/documentos');
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
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Archivo Actual */}
            {documento.ruta_archivo_digital && (
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconCheck size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Archivo actual: {documento.ruta_archivo_digital.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {updateFile ? 'Click para seleccionar un nuevo archivo PDF' : 'Documento tiene archivo PDF adjunto'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUpdateFile(!updateFile);
                        setNewFile(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] transition-colors"
                    >
                      {updateFile ? <><IconX size={16} /> Cancelar</> : 'Cambiar archivo'}
                    </button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Upload Nuevo Archivo */}
            {(updateFile || !documento.ruta_archivo_digital) && (
              <Card>
                <CardHeader
                  title={documento.ruta_archivo_digital ? "Nuevo Archivo PDF" : "Archivo PDF"}
                  subtitle="Seleccione un archivo PDF para adjuntar al documento"
                />
                <CardBody>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#032DFF] transition-colors">
                    <div className="space-y-1 text-center">
                      <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="archivo"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-[#032DFF] hover:text-[#0225cc]"
                        >
                          <span>Subir archivo</span>
                          <input
                            id="archivo"
                            name="archivo"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF hasta 400MB</p>
                      {newFile && (
                        <p className="text-sm text-green-600 font-medium mt-2">
                          ✓ Nuevo archivo: {newFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Información Básica */}
            <Card>
              <CardHeader
                title="Información Básica"
                subtitle="Datos principales del documento"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Áreas y Clasificación */}
            <Card>
              <CardHeader
                title="Áreas y Clasificación"
                subtitle="Información de procedencia, destino y estado"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  {/* Área Destino */}
                  <FormField label="Área de Destino">
                    <SearchableSelect
                      options={areaOptions}
                      value={formData.id_area_destino}
                      onChange={(value) => setFormData((prev) => ({ ...prev, id_area_destino: Number(value) }))}
                      placeholder="Seleccione área"
                    />
                  </FormField>

                  {/* Número de Folios */}
                  <FormField
                    label="Número de Folios"
                    required
                    htmlFor="numero_folios"
                  >
                    <input
                      type="number"
                      id="numero_folios"
                      name="numero_folios"
                      value={formData.numero_folios}
                      onChange={handleChange}
                      min={1}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Archivador */}
                  <FormField label="Archivador">
                    <SearchableSelect
                      options={archivadorOptions}
                      value={formData.id_archivador}
                      onChange={(value) => setFormData((prev) => ({ ...prev, id_archivador: Number(value) }))}
                      placeholder="Seleccione archivador"
                      emptyMessage={formData.id_area_origen ? "No hay archivadores disponibles" : "Seleccione primero un área"}
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
              </CardBody>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader title="Información Adicional" />
              <CardBody>
                <FormField label="Observaciones">
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Detalles adicionales del documento..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                  />
                </FormField>
              </CardBody>

              <CardFooter>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <IconDeviceFloppy size={18} />
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/documentos')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    <IconArrowLeft size={18} />
                    Cancelar
                  </button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default DocumentoEditarPage;
