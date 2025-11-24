/**
 * Nuevo Documento Page
 * Formulario para crear un nuevo documento con upload de archivo PDF
 * UPDATED: Using FormField and Card components for consistent UI
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy, IconUpload } from '@tabler/icons-react';
import { PageContainer, PageHeader, FormField, Card, CardHeader, CardBody, SearchableSelect, UploadProgressModal } from '@/components/ui';
import { documentoService, areaService, archivadorService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const DocumentoNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_documento: '',
    asunto: '',
    fecha_documento: new Date().toISOString().split('T')[0],
    numero_folios: 1,
    observaciones: '',
    id_tipo_documento: 1,
    id_area_origen: 0,
    id_area_destino: 0,
    destinatario_externo: '',
    id_archivador: 0,
    id_estado: 1,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

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

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      setShowProgressModal(true);
      setUploadProgress(0);
      return documentoService.create(data, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento creado',
        description: 'El documento ha sido registrado correctamente',
      });
      navigate('/documentos');
    },
    onSettled: () => {
      setShowProgressModal(false);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el documento',
        variant: 'destructive',
      });
    },
  });

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
      setSelectedFile(file);
    }
  };

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

    const data = new FormData();
    data.append('nombre_documento', formData.nombre_documento);
    data.append('asunto', formData.asunto);
    data.append('fecha_documento', formData.fecha_documento);
    data.append('numero_folios', String(formData.numero_folios));
    data.append('id_tipo_documento', String(formData.id_tipo_documento));
    data.append('id_area_origen', String(formData.id_area_origen));
    data.append('id_estado', String(formData.id_estado));

    // Solo agregar campos opcionales si tienen valores válidos
    if (formData.observaciones) data.append('observaciones', formData.observaciones);
    if (formData.id_area_destino && formData.id_area_destino > 0) data.append('id_area_destino', String(formData.id_area_destino));
    if (formData.destinatario_externo) data.append('destinatario_externo', formData.destinatario_externo);
    if (formData.id_archivador && formData.id_archivador > 0) data.append('id_archivador', String(formData.id_archivador));
    if (selectedFile) data.append('archivo', selectedFile);

    createMutation.mutate(data);
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

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Documento"
        description="Registrar un nuevo documento en el sistema"
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/documentos'),
          label: 'Volver a documentos',
        }}
      />

      <div className="p-6">

        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <Card>
                <CardHeader
                  title="Detalles del Documento"
                  subtitle="Información principal"
                />
                <CardBody>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
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
                          placeholder="Seleccione origen"
                          error={!!errors.id_area_origen}
                        />
                      </FormField>

                      <FormField label="Archivador">
                        <SearchableSelect
                          options={archivadorOptions}
                          value={formData.id_archivador}
                          onChange={(value) => setFormData((prev) => ({ ...prev, id_archivador: Number(value) }))}
                          placeholder="Seleccione archivador"
                          emptyMessage={formData.id_area_origen ? "No hay archivadores" : "Seleccione área origen"}
                        />
                      </FormField>
                      
                      <FormField
                        label="Nombre del Documento"
                        required
                        error={errors.nombre_documento}
                        htmlFor="nombre_documento"
                        className="md:col-span-2"
                      >
                        <input
                          type="text"
                          id="nombre_documento"
                          name="nombre_documento"
                          value={formData.nombre_documento}
                          onChange={handleChange}
                          maxLength={100}
                          placeholder="Ej: Informe Mensual de Actividades..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent font-medium"
                        />
                      </FormField>

                    </div>

                    <FormField
                      label="Asunto"
                      required
                      error={errors.asunto}
                      htmlFor="asunto"
                    >
                      <textarea
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Descripción breve del contenido del documento..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                      />
                    </FormField>

                    <FormField label="Observaciones">
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Notas adicionales (opcional)..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                      />
                    </FormField>
                  </div>
                </CardBody>
              </Card>
              {/* Archivo Digital (Prominent) */}
              <Card className="border-blue-100 shadow-md">
                <CardHeader
                  title="Archivo Digital"
                  subtitle="Adjunte el documento PDF (Máx. 400MB)"
                />
                <CardBody>
                  <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-blue-100 border-dashed rounded-xl hover:border-[#032DFF] hover:bg-blue-50/30 transition-all group cursor-pointer">
                    <div className="space-y-2 text-center">
                      <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconUpload className="h-8 w-8 text-[#032DFF]" />
                      </div>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="archivo"
                          className="relative cursor-pointer rounded-md font-medium text-[#032DFF] hover:text-[#0225cc] focus-within:outline-none"
                        >
                          <span>Subir archivo PDF</span>
                          <input
                            id="archivo"
                            name="archivo"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">Arrastrar y soltar o hacer clic</p>
                      {selectedFile && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                          <IconFileText size={14} />
                          {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Metadata & Actions (1/3) */}
            <div className="space-y-6">
              
              

              {/* Clasificación */}
              <Card>
                <CardHeader
                  title="Clasificación"
                  subtitle="Metadatos del documento"
                />
                <CardBody className="space-y-5">
                  <FormField
                    label="Fecha"
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

                  <div className="pt-4 border-t border-gray-100">
                    <FormField
                      label="Área de Destino"
                    >
                      <SearchableSelect
                        options={areaOptions}
                        value={formData.id_area_destino}
                        onChange={(value) => setFormData((prev) => ({ ...prev, id_area_destino: Number(value) }))}
                        placeholder="Seleccione destino"
                      />
                    </FormField>
                  </div>
                </CardBody>
              </Card>



              {/* Actions Card (Sticky-ish) */}
              <Card className="bg-gray-50/50 border-blue-100">
                <CardBody>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40"
                    >
                      <IconDeviceFloppy size={20} />
                      {createMutation.isPending ? 'Guardando...' : 'Guardar Documento'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/documentos')}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium transition-colors"
                    >
                      <IconArrowLeft size={18} />
                      Cancelar
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </form>
        </div>
      </div>

      
      <UploadProgressModal
        isOpen={showProgressModal}
        progress={uploadProgress}
        fileName={selectedFile?.name}
      />
    </PageContainer>
  );
};

export default DocumentoNuevoPage;
