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
  const [generatedName, setGeneratedName] = useState('');

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
      description: `${arch.tipoDocumentoContenido?.nombre_tipo} • Ocupado: ${arch.total_folios} folios`,
    }));

  // Función para generar el prenombre del documento
  const generateDocumentName = (areaId: number, archivadorId: number) => {
    const selectedArea = areas.find((area: any) => area.id_area === areaId);
    const selectedArchivador = archivadores.find((arch: any) => arch.id_archivador === archivadorId);
    
    if (!selectedArea || !selectedArchivador) {
      return '';
    }

    // Obtener siglas del área
    const areaSiglas = selectedArea.siglas || selectedArea.nombre_area.substring(0, 3).toUpperCase();
    
    // Obtener nombre tipo documento
    const tipoDocNombre = selectedArchivador.tipoDocumentoContenido?.nombre_tipo || '';
    
    // Obtener año actual
    const currentYear = new Date().getFullYear();
    
    // Generar número secuencial (puedes ajustar esto según tu lógica)
    const sequentialNumber = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    // Formato: TipoDocumento NombreArea secuencial-YYYY-Siglas
    // Ej: Acuerdo Consejo 0001-2025-ALC
    const generated = `${tipoDocNombre} ${sequentialNumber}-${currentYear}-${areaSiglas}`;
    
    return generated;
  };

  // Generar nombre cuando cambien área, archivador o tipo documento
  const updateGeneratedName = (areaId?: number, archivadorId?: number) => {
    const finalAreaId = areaId !== undefined ? areaId : formData.id_area_origen;
    const finalArchivadorId = archivadorId !== undefined ? archivadorId : formData.id_archivador;

    if (finalAreaId && finalArchivadorId) {
      const generated = generateDocumentName(finalAreaId, finalArchivadorId);
      setGeneratedName(generated);
    } else {
      setGeneratedName('');
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Main Grid - Left Content and Right Metadata */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
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
                              const numValue = Number(value);
                              setFormData((prev) => ({ ...prev, id_area_origen: numValue }));
                              updateGeneratedName(numValue, formData.id_archivador);
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
                              updateGeneratedName(formData.id_area_origen, numValue);
                            }}
                            placeholder="Seleccione archivador"
                            emptyMessage={formData.id_area_origen ? "No hay archivadores" : "Seleccione área origen"}
                          />
                        </FormField>

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
                            type="text"
                            id="numero_folios"
                            name="numero_folios"
                            value={formData.numero_folios}
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              // Solo permitir números positivos
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
                        
                        <FormField
                          label="Nombre del Documento"
                          required
                          error={errors.nombre_documento}
                          htmlFor="nombre_documento"
                          className="md:col-span-2"
                        >
                          <div className="space-y-2">
                            <div className="relative">
                              <input
                                type="text"
                                id="nombre_documento"
                                name="nombre_documento"
                                value={formData.nombre_documento}
                                onChange={handleChange}
                                maxLength={100}
                                placeholder={generatedName || "Ej: Informe Mensual de Actividades..."}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent font-medium"
                              />
                              {generatedName && !formData.nombre_documento && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, nombre_documento: generatedName }));
                                    if (errors.nombre_documento) {
                                      setErrors((prev) => ({ ...prev, nombre_documento: '' }));
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-[#032DFF] text-white px-3 py-1 rounded hover:bg-[#0225cc] transition-colors font-medium whitespace-nowrap"
                                >
                                  Usar
                                </button>
                              )}
                            </div>
                            {generatedName && (
                              <div className="text-xs text-gray-600 px-2 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="font-semibold text-[#032DFF]">Prenombre sugerido:</span> {generatedName}
                              </div>
                            )}
                          </div>
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

                      
                    </div>
                  </CardBody>
                </Card>
                
              </div>

              {/* Right Column - Metadata (1/3) */}
              <div className="space-y-6">
                {/* Archivo Digital (Prominent) */}
                <Card className="border-blue-100 shadow-lg overflow-hidden">
                  <CardHeader
                    title="Archivo Digital"
                    subtitle="Adjunte el documento PDF (Máx. 400MB)"
                  />
                  <CardBody>
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

                          {selectedFile && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200 shadow-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="truncate max-w-[180px]">{selectedFile.name}</span>
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
                  </CardBody>
                </Card>

                {/* Actions Card */}
                <Card className="border-blue-200 bg-linear-to-br from-white to-blue-50/30">
                  <CardBody className="space-y-3">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-[#032DFF] to-[#0225cc] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 text-sm"
                    >
                      <IconDeviceFloppy size={18} />
                      {createMutation.isPending ? 'Guardando...' : 'Guardar'}
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
        fileName={selectedFile?.name}
      />
    </PageContainer>
  );
};

export default DocumentoNuevoPage;
