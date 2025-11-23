/**
 * Nuevo Archivador Page
 * Formulario para crear un nuevo archivador
 * UPDATED: Using FormField and Card components for consistent UI
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconArchive, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, FormField, Card, CardHeader, CardBody, CardFooter, SearchableSelect } from '@/components/ui';
import { archivadorService, areaService, tipoDocumentoService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const ArchivadorNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<{
    nombre_archivador: string;
    descripcion: string;
    id_area_propietaria: number;
    id_tipo_documento_contenido: number;
    ubicacion_fisica: string;
    estado: 'Abierto' | 'Cerrado' | 'En Custodia';
  }>({
    nombre_archivador: '',
    descripcion: '',
    id_area_propietaria: 0,
    id_tipo_documento_contenido: 1,
    ubicacion_fisica: '',
    estado: 'Abierto',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch areas for dropdown
  const { data: areasData = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  // Fetch tipos documento
  const { data: tiposDocumentoData } = useQuery({
    queryKey: ['tiposDocumento'],
    queryFn: tipoDocumentoService.getAll,
  });

  const areas = Array.isArray(areasData) ? areasData : [];
  const tiposDocumento = Array.isArray(tiposDocumentoData) ? tiposDocumentoData : [];

  // Prepare options for SearchableSelect
  const areaOptions = areas.map((area: any) => ({
    value: area.id_area,
    label: area.nombre_area,
  }));

  const tipoDocumentoOptions = tiposDocumento.map((tipo: any) => ({
    value: tipo.id_tipo_documento,
    label: tipo.nombre_tipo,
  }));

  const createMutation = useMutation({
    mutationFn: archivadorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivadores'] });
      toast({
        title: 'Archivador creado',
        description: 'El archivador ha sido creado correctamente',
      });
      navigate('/archivadores');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el archivador',
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_archivador.trim()) {
      newErrors.nombre_archivador = 'El nombre del archivador es requerido';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (!formData.id_area_propietaria) {
      newErrors.id_area_propietaria = 'Debe seleccionar un área propietaria';
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

    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'id_area_propietaria' || name === 'id_tipo_documento_contenido' ? Number(value) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Archivador"
        description="Crear un nuevo archivador físico"
        icon={<IconArchive size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/archivadores'),
          label: 'Volver a archivadores',
        }}
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader
                title="Información Básica"
                subtitle="Datos principales del archivador"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <FormField
                    label="Nombre del Archivador"
                    required
                    error={errors.nombre_archivador}
                    htmlFor="nombre_archivador"
                  >
                    <input
                      type="text"
                      id="nombre_archivador"
                      name="nombre_archivador"
                      value={formData.nombre_archivador}
                      onChange={handleChange}
                      maxLength={50}
                      placeholder="Ej: ARCH-2024-001"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                    />
                  </FormField>

                  {/* Área Propietaria */}
                  <FormField
                    label="Área Propietaria"
                    required
                    error={errors.id_area_propietaria}
                  >
                    <SearchableSelect
                      options={areaOptions}
                      value={formData.id_area_propietaria}
                      onChange={(value) => {
                        setFormData((prev) => ({ ...prev, id_area_propietaria: Number(value) }));
                        if (errors.id_area_propietaria) {
                          setErrors((prev) => ({ ...prev, id_area_propietaria: '' }));
                        }
                      }}
                      placeholder="Seleccione área"
                      error={!!errors.id_area_propietaria}
                    />
                  </FormField>
                </div>

                {/* Descripción */}
                <FormField
                  label="Descripción"
                  required
                  error={errors.descripcion}
                  htmlFor="descripcion"
                  className="mt-6"
                >
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    maxLength={255}
                    placeholder="Descripción del archivador"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                  />
                </FormField>
              </CardBody>
            </Card>

            {/* Clasificación y Ubicación */}
            <Card>
              <CardHeader
                title="Clasificación y Ubicación"
                subtitle="Tipo de documento y ubicación física"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo de Documento */}
                  <FormField label="Tipo de Documento Contenido" required>
                    <SearchableSelect
                      options={tipoDocumentoOptions}
                      value={formData.id_tipo_documento_contenido}
                      onChange={(value) => setFormData((prev) => ({ ...prev, id_tipo_documento_contenido: Number(value) }))}
                      placeholder="Seleccione tipo de documento"
                    />
                  </FormField>

                  {/* Estado */}
                  <FormField label="Estado">
                    <SearchableSelect
                      options={[
                        { value: 'Abierto', label: 'Abierto' },
                        { value: 'Cerrado', label: 'Cerrado' },
                        { value: 'En Custodia', label: 'En Custodia' },
                      ]}
                      value={formData.estado}
                      onChange={(value) => setFormData((prev) => ({ ...prev, estado: String(value) as 'Abierto' | 'Cerrado' | 'En Custodia' }))}
                      placeholder="Seleccione estado"
                    />
                  </FormField>
                </div>

                {/* Ubicación Física */}
                <FormField label="Ubicación Física" htmlFor="ubicacion_fisica" className="mt-6">
                  <input
                    type="text"
                    id="ubicacion_fisica"
                    name="ubicacion_fisica"
                    value={formData.ubicacion_fisica}
                    onChange={handleChange}
                    maxLength={255}
                    placeholder="Ej: Estante 3, Nivel 2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                  />
                </FormField>
              </CardBody>

              <CardFooter>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <IconDeviceFloppy size={18} />
                    {createMutation.isPending ? 'Guardando...' : 'Guardar Archivador'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/archivadores')}
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

export default ArchivadorNuevoPage;
