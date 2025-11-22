/**
 * Nueva Área Page
 * Formulario para crear una nueva área
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFolders, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader } from '@/components/ui';
import { areaService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const AreaNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_area: '',
    siglas: '',
    estado: true,
  });

  const createMutation = useMutation({
    mutationFn: areaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({
        title: 'Área creada',
        description: 'El área ha sido creada correctamente',
      });
      navigate('/areas');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el área',
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
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nueva Área"
        description="Crear una nueva área organizacional"
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
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <IconDeviceFloppy size={18} />
              {createMutation.isPending ? 'Guardando...' : 'Guardar Área'}
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

export default AreaNuevoPage;
