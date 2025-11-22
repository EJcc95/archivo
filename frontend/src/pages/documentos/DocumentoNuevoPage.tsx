/**
 * Nuevo Documento Page
 * Formulario para crear un nuevo documento con upload de archivo PDF
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy, IconUpload } from '@tabler/icons-react';
import { PageContainer, PageHeader } from '@/components/ui';
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

  const createMutation = useMutation({
    mutationFn: (data: FormData) => documentoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Documento creado',
        description: 'El documento ha sido registrado correctamente',
      });
      navigate('/documentos');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_documento.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del documento es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.id_area_origen) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar el área de origen',
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
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre_documento" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre_documento"
                name="nombre_documento"
                value={formData.nombre_documento}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fecha */}
            <div>
              <label htmlFor="fecha_documento" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha_documento"
                name="fecha_documento"
                value={formData.fecha_documento}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
              Asunto <span className="text-red-500">*</span>
            </label>
            <textarea
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Área Origen */}
            <div>
              <label htmlFor="id_area_origen" className="block text-sm font-medium text-gray-700 mb-2">
                Área de Origen <span className="text-red-500">*</span>
              </label>
              <select
                id="id_area_origen"
                name="id_area_origen"
                value={formData.id_area_origen}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione área</option>
                {areas.map((area: any) => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            </div>

            {/* Área Destino */}
            <div>
              <label htmlFor="id_area_destino" className="block text-sm font-medium text-gray-700 mb-2">
                Área de Destino
              </label>
              <select
                id="id_area_destino"
                name="id_area_destino"
                value={formData.id_area_destino}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione área</option>
                {areas.map((area: any) => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            </div>

            {/* Número de Folios */}
            <div>
              <label htmlFor="numero_folios" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Folios <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="numero_folios"
                name="numero_folios"
                value={formData.numero_folios}
                onChange={handleChange}
                required
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Archivador */}
          <div>
            <label htmlFor="id_archivador" className="block text-sm font-medium text-gray-700 mb-2">
              Archivador
            </label>
            <select
              id="id_archivador"
              name="id_archivador"
              value={formData.id_archivador}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione archivador</option>
              {archivadores
                .filter((arch: any) => 
                  (!formData.id_area_origen || arch.id_area_propietaria === Number(formData.id_area_origen)) &&
                  (!formData.id_tipo_documento || arch.id_tipo_documento_contenido === Number(formData.id_tipo_documento))
                )
                .map((arch: any) => (
                <option key={arch.id_archivador} value={arch.id_archivador}>
                  {arch.nombre_archivador} - {arch.areaPropietaria?.nombre_area}
                </option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Upload File */}
          <div>
            <label htmlFor="archivo" className="block text-sm font-medium text-gray-700 mb-2">
              Archivo PDF
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="archivo"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
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
                {selectedFile && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <IconDeviceFloppy size={18} />
              {createMutation.isPending ? 'Guardando...' : 'Guardar Documento'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/documentos')}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              <IconArrowLeft size={18} />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default DocumentoNuevoPage;
