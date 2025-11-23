/**
 * Nueva Área Page
 * Formulario para crear una nueva área
 * UPDATED: Using FormField and Card components for consistent UI
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFolders, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, FormField, Card, CardHeader, CardBody, CardFooter } from '@/components/ui';
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el área',
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_area.trim()) {
      newErrors.nombre_area = 'El nombre del área es requerido';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Área */}
            <Card>
              <CardHeader
                title="Información del Área"
                subtitle="Datos principales de la nueva área"
              />
              <CardBody>
                <div className="space-y-6">
                  {/* Nombre */}
                  <FormField
                    label="Nombre del Área"
                    required
                    error={errors.nombre_area}
                    htmlFor="nombre_area"
                  >
                    <input
                      type="text"
                      id="nombre_area"
                      name="nombre_area"
                      value={formData.nombre_area}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Ej: Recursos Humanos"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                    />
                  </FormField>

                  {/* Siglas */}
                  <FormField
                    label="Siglas"
                    htmlFor="siglas"
                  >
                    <input
                      type="text"
                      id="siglas"
                      name="siglas"
                      value={formData.siglas}
                      onChange={handleChange}
                      maxLength={50}
                      placeholder="Ej: RRHH"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                    />
                  </FormField>

                  {/* Estado */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="estado"
                      name="estado"
                      checked={formData.estado}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#032DFF] border-gray-300 rounded focus:ring-[#032DFF]"
                    />
                    <label htmlFor="estado" className="text-sm font-medium text-gray-700">
                      Área activa
                    </label>
                  </div>
                </div>
              </CardBody>

              <CardFooter>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <IconDeviceFloppy size={18} />
                    {createMutation.isPending ? 'Guardando...' : 'Guardar Área'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/areas')}
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

export default AreaNuevoPage;
