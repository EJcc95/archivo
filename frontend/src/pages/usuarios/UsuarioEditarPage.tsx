/**
 * Usuario Editar Page
 * Formulario para editar un usuario existente
 * UPDATED: Using Card and FormField components
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUserEdit, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, SearchableSelect, Card, CardHeader, CardBody, CardFooter, FormField } from '@/components/ui';
import { userService } from '@/services';
import { roleService } from '@/services/roleService';
import { areaService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const UsuarioEditarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    id_rol: 0,
    id_area: 0,
    estado: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(Number(id)),
    enabled: !!id,
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

  // Populate form when data loads
  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        id_rol: user.id_rol || 0,
        id_area: user.id_area || 0,
        estado: user.estado ?? true,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado exitosamente',
      });
      navigate('/usuarios');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el usuario',
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

    updateMutation.mutate(dataToSubmit);
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

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="p-6 text-center text-gray-500">
          Usuario no encontrado
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar Usuario"
        description={`Modificar información de ${user.nombre_usuario}`}
        icon={<IconUserEdit size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/usuarios'),
          label: 'Volver a usuarios',
        }}
      />

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <IconDeviceFloppy size={18} />
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
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

export default UsuarioEditarPage;
