/**
 * Rol Nuevo Page
 * Formulario para crear nuevos roles
 * UPDATED: Using Card and FormField components
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconShieldCheck,
  IconDeviceFloppy,
  IconArrowLeft,
} from '@tabler/icons-react';
import { roleService } from '@/services/roleService';
import type { CreateRolRequest } from '@/types';
import { PageContainer, PageHeader, Card, CardHeader, CardBody, CardFooter, FormField } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const RolNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Permisos
  const canAdmin = hasPermission('users_admin');

  // Estados
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<CreateRolRequest>({
    nombre_rol: '',
    descripcion: '',
  });

  // Verificar permisos
  useEffect(() => {
    if (!canAdmin) {
      toast.error('No tienes permisos para crear roles');
      navigate('/roles');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAdmin]);

  // Manejar cambios en inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: CreateRolRequest) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_rol?.trim()) {
      newErrors.nombre_rol = 'El nombre del rol es requerido';
    } else if (formData.nombre_rol.length < 2 || formData.nombre_rol.length > 50) {
      newErrors.nombre_rol = 'El nombre debe tener entre 2 y 50 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      await roleService.create(formData);
      toast.success('Rol creado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error al crear el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Rol"
        description="Crea un nuevo rol para asignar permisos a usuarios"
        icon={<IconShieldCheck  size={32} className="text-white" strokeWidth={1.5} />}
        backButton={{
          onClick: () => navigate('/roles'),
          label: "Volver a roles",
        }}
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información sobre permisos */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IconShieldCheck size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Asignación de permisos
                  </p>
                  <p className="text-sm text-blue-800">
                    Después de crear el rol, podrás asignarle los permisos específicos desde la 
                    página de detalle o desde el listado de roles usando el botón de "Gestionar permisos".
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader
                title="Información del Rol"
                subtitle="Datos básicos e identificación"
              />
              <CardBody>
                {/* Nombre del rol */}
                <FormField
                  label="Nombre del Rol"
                  required
                  error={errors.nombre_rol}
                  help="El nombre debe ser descriptivo y único"
                  htmlFor="nombre_rol"
                >
                  <input
                    type="text"
                    id="nombre_rol"
                    name="nombre_rol"
                    value={formData.nombre_rol}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                    placeholder="Ej: Administrador, Supervisor, Operador"
                  />
                </FormField>

                {/* Descripción */}
                <FormField
                  label="Descripción"
                  error={errors.descripcion}
                  help={`Máximo 500 caracteres. ${formData.descripcion?.length || 0}/500`}
                  htmlFor="descripcion"
                  className="mt-6"
                >
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                    placeholder="Describe las responsabilidades y alcance de este rol..."
                  />
                </FormField>
              </CardBody>
              <CardFooter>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <IconDeviceFloppy size={18} />
                    {loading ? 'Creando...' : 'Crear Rol'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/roles')}
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

export default RolNuevoPage;
