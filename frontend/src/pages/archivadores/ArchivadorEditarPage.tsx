/**
 * Editar Archivador Page
 * Formulario para editar un archivador existente
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconArchive, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader } from '@/components/ui';
import { archivadorService, areaService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const ArchivadorEditarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_archivador: '',
    descripcion: '',
    id_area_propietaria: 0,
    id_tipo_documento_contenido: 1,
    ubicacion_fisica: '',
    estado: 'Abierto' as const,
  });

  // Fetch archivador
  const { data: archivador, isLoading } = useQuery({
    queryKey: ['archivador', id],
    queryFn: () => archivadorService.getById(Number(id)),
    enabled: !!id,
  });

  // Fetch areas for dropdown
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  // Populate form when data loads
  useEffect(() => {
    if (archivador) {
      setFormData({
        nombre_archivador: archivador.nombre_archivador || '',
        descripcion: archivador.descripcion || '',
        id_area_propietaria: archivador.id_area_propietaria || 0,
        id_tipo_documento_contenido: archivador.id_tipo_documento_contenido || 1,
        ubicacion_fisica: archivador.ubicacion_fisica || '',
        estado: archivador.estado || 'Abierto',
      });
    }
  }, [archivador]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => archivadorService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivadores'] });
      queryClient.invalidateQueries({ queryKey: ['archivador', id] });
      toast({
        title: 'Archivador actualizado',
        description: 'El archivador ha sido actualizado correctamente',
      });
      navigate('/archivadores');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el archivador',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_archivador.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del archivador es requerido',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.id_area_propietaria) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un área propietaria',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'id_area_propietaria' || name === 'id_tipo_documento_contenido' ? Number(value) : value,
    }));
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

  if (!archivador) {
    return (
      <PageContainer>
        <div className="p-6 text-center text-gray-500">
          Archivador no encontrado
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar Archivador"
        description={`Modificar información de ${archivador.nombre_archivador}`}
        icon={<IconArchive size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/archivadores'),
          label: 'Volver a archivadores',
        }}
      />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre_archivador" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Archivador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre_archivador"
              name="nombre_archivador"
              value={formData.nombre_archivador}
              onChange={handleChange}
              required
              maxLength={50}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: ARCH-2024-001"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={3}
              maxLength={255}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción del archivador"
            />
          </div>

          {/* Área Propietaria */}
          <div>
            <label htmlFor="id_area_propietaria" className="block text-sm font-medium text-gray-700 mb-2">
              Área Propietaria <span className="text-red-500">*</span>
            </label>
            <select
              id="id_area_propietaria"
              name="id_area_propietaria"
              value={formData.id_area_propietaria}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione un área</option>
              {Array.isArray(areas) && areas.map((area: any) => (
                <option key={area.id_area} value={area.id_area}>
                  {area.nombre_area}
                </option>
              ))}
            </select>
          </div>

          {/* Ubicación Física */}
          <div>
            <label htmlFor="ubicacion_fisica" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación Física
            </label>
            <input
              type="text"
              id="ubicacion_fisica"
              name="ubicacion_fisica"
              value={formData.ubicacion_fisica}
              onChange={handleChange}
              maxLength={255}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Estante 3, Nivel 2"
            />
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Abierto">Abierto</option>
              <option value="Cerrado">Cerrado</option>
              <option value="En Custodia">En Custodia</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <IconDeviceFloppy size={18} />
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/archivadores')}
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

export default ArchivadorEditarPage;
