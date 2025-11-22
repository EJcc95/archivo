/**
 * Editar Área Page
 * Formulario para editar un área existente
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFolders, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader } from '@/components/ui';
import { areaService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const AreaEditarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_area: '',
    siglas: '',
    estado: true,
  });

  // Fetch area
  const { data: area, isLoading } = useQuery({
    queryKey: ['area', id],
    queryFn: () => areaService.getById(Number(id)),
    enabled: !!id,
  });

  // Populate form when data loads
  useEffect(() => {
    if (area) {
      setFormData({
        nombre_area: area.nombre_area || '',
        siglas: area.siglas || '',
        estado: area.estado ?? true,
      });
    }
  }, [area]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => areaService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['area', id] });
      toast({
        title: 'Área actualizada',
        description: 'El área ha sido actualizada correctamente',
      });
      navigate('/areas');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el área',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_area.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del área es requerido',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  if (!area) {
    return (
      <PageContainer>
        <div className="p-6 text-center text-gray-500">
          Área no encontrada
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar Área"
        description={`Modificar información de ${area.nombre_area}`}
        icon={<IconFolders size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/areas'),
          label: 'Volver a áreas',
        }}
      />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre_area" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Área <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre_area"
              name="nombre_area"
              value={formData.nombre_area}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Recursos Humanos"
            />
          </div>

          {/* Siglas */}
          <div>
            <label htmlFor="siglas" className="block text-sm font-medium text-gray-700 mb-2">
              Siglas
            </label>
            <input
              type="text"
              id="siglas"
              name="siglas"
              value={formData.siglas}
              onChange={handleChange}
              maxLength={50}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: RRHH"
            />
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="estado"
              name="estado"
              checked={formData.estado}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="estado" className="text-sm font-medium text-gray-700">
              Área activa
            </label>
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
              onClick={() => navigate('/areas')}
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

export default AreaEditarPage;
