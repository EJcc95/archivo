/**
 * Usuario Nuevo Page
 * Formulario para crear un nuevo usuario
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUserPlus, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, SearchableSelect } from '@/components/ui';
import { userService } from '@/services';
import { roleService } from '@/services/roleService';
import { areaService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const UsuarioNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_usuario: '',
    nombres: '',
    apellidos: '',
    email: '',
    id_rol: 0,
    id_area: 0,
    estado: true,
  });

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });

  // Fetch areas
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll,
  });

  const roles = Array.isArray(rolesData) ? rolesData : [];
  const areas = Array.isArray(areasData) ? areasData : [];

  // Options for SearchableSelect
  const rolOptions = roles.map((rol: any) => ({
    value: rol.id_rol,
    label: rol.nombre_rol,
    description: rol.descripcion,
  }));

  const areaOptions = [
    { value: 0, label: 'Sin área asignada' },
    ...areas.map((area: any) => ({
      value: area.id_area,
      label: area.nombre_area,
    }))
  ];

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente. Se ha enviado un correo con las credenciales de acceso.',
      });
      navigate('/usuarios');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el usuario',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombres.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Error',
        description: 'El email es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.id_rol) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un rol',
        variant: 'destructive',
      });
      return;
    }

    const dataToSubmit = {
      ...formData,
      id_area: formData.id_area === 0 ? undefined : formData.id_area,
    };

    createMutation.mutate(dataToSubmit);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Usuario"
        description="Crear un nuevo usuario del sistema"
        icon={<IconUserPlus size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/usuarios'),
          label: 'Volver a usuarios',
        }}
      />

      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Generación automática</h3>
                <p className="text-sm text-blue-700 mt-1">
                  El nombre de usuario y contraseña se generarán automáticamente. Las credenciales se enviarán al email del usuario.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombres */}
          <div>
            <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              maxLength={75}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: John"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: john.doe@ejemplo.com"
            />
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="id_rol" className="block text-sm font-medium text-gray-700 mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={rolOptions}
              value={formData.id_rol}
              onChange={(val: string | number) => setFormData(prev => ({ ...prev, id_rol: Number(val) }))}
              placeholder="Seleccione un rol"
            />
          </div>

          {/* Área */}
          <div>
            <label htmlFor="id_area" className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <SearchableSelect
              options={areaOptions}
              value={formData.id_area}
              onChange={(val: string | number) => setFormData(prev => ({ ...prev, id_area: Number(val) }))}
              placeholder="Seleccione un área (opcional)"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="estado"
                checked={formData.estado}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Usuario activo</span>
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
              {createMutation.isPending ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              <IconArrowLeft size={18} />
              Cancelar
            </button>
          </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default UsuarioNuevoPage;
