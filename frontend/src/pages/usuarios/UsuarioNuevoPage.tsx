/**
 * Usuario Nuevo Page
 * Formulario para crear un nuevo usuario
 * UPDATED: Using Card and FormField components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUserPlus, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, SearchableSelect, Card, CardHeader, CardBody, CardFooter, FormField } from '@/components/ui';
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.id_rol) {
      newErrors.id_rol = 'Debe seleccionar un rol';
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
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Card>
              <CardHeader
                title="Información Personal"
                subtitle="Datos básicos del usuario"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombres */}
                  <FormField
                    label="Nombres"
                    required
                    error={errors.nombres}
                    htmlFor="nombres"
                  >
                    <input
                      type="text"
                      id="nombres"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      maxLength={75}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                      placeholder="Ej: John"
                    />
                  </FormField>

                  {/* Apellidos */}
                  <FormField
                    label="Apellidos"
                    required
                    error={errors.apellidos}
                    htmlFor="apellidos"
                  >
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                      placeholder="Ej: Doe"
                    />
                  </FormField>
                </div>

                {/* Email */}
                <FormField
                  label="Email"
                  required
                  error={errors.email}
                  htmlFor="email"
                  className="mt-6"
                >
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                    placeholder="Ej: john.doe@ejemplo.com"
                  />
                </FormField>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Rol y Permisos"
                subtitle="Configuración de acceso y ubicación"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rol */}
                  <FormField
                    label="Rol"
                    required
                    error={errors.id_rol}
                  >
                    <SearchableSelect
                      options={rolOptions}
                      value={formData.id_rol}
                      onChange={(val: string | number) => {
                        setFormData(prev => ({ ...prev, id_rol: Number(val) }));
                        if (errors.id_rol) setErrors(prev => ({ ...prev, id_rol: '' }));
                      }}
                      placeholder="Seleccione un rol"
                      error={!!errors.id_rol}
                    />
                  </FormField>

                  {/* Área */}
                  <FormField
                    label="Área"
                    help="Opcional"
                  >
                    <SearchableSelect
                      options={areaOptions}
                      value={formData.id_area}
                      onChange={(val: string | number) => setFormData(prev => ({ ...prev, id_area: Number(val) }))}
                      placeholder="Seleccione un área"
                    />
                  </FormField>
                </div>

                {/* Estado */}
                <div className="mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formData.estado}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#032DFF] border-gray-300 rounded focus:ring-[#032DFF]"
                    />
                    <span className="text-sm font-medium text-gray-700">Usuario activo</span>
                  </label>
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
                    {createMutation.isPending ? 'Creando...' : 'Crear Usuario'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/usuarios')}
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

export default UsuarioNuevoPage;
