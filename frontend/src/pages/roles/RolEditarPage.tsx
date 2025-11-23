/**
 * Rol Editar Page
 * Formulario para editar roles existentes
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconShieldCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { roleService } from '@/services/roleService';
import type { UpdateRolRequest, RolConPermisos } from '@/types';
import Button from '@/components/ui/Button';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const RolEditarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Permisos
  const canAdmin = hasPermission('users_admin');

  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [rol, setRol] = useState<RolConPermisos | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<UpdateRolRequest>({
    nombre_rol: '',
    descripcion: '',
  });

  // Verificar permisos
  useEffect(() => {
    if (!canAdmin) {
      toast.error('No tienes permisos para editar roles');
      navigate('/roles');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAdmin]);

  // Cargar datos del rol
  useEffect(() => {
    if (!id) {
      toast.error('ID de rol no válido');
      navigate('/roles');
      return;
    }

    const loadRol = async () => {
      try {
        setLoadingData(true);
        const data = await roleService.getById(Number(id));
        setRol(data);
        setFormData({
          nombre_rol: data.nombre_rol,
          descripcion: data.descripcion || '',
        });
      } catch (error) {
        console.error('Error loading rol:', error);
        toast.error('Error al cargar el rol');
        navigate('/roles');
      } finally {
        setLoadingData(false);
      }
    };

    loadRol();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Manejar cambios en inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
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

    if (!id) return;

    try {
      setLoading(true);
      await roleService.update(Number(id), formData);
      toast.success('Rol actualizado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#3f37c9] mb-4"></div>
          <p className="text-gray-500">Cargando rol...</p>
        </div>
      </div>
    );
  }

  if (!rol) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar Rol"
        description={`Modifica la información del rol ${rol.nombre_rol}`}
        icon={<IconShieldCheck size={32} className="text-white" strokeWidth={1.5} />}
        backButton={{
          onClick: () => navigate('/roles'),
          label: "Roles",
        }}
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del rol */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconShieldCheck size={20} />
            Información del Rol
          </h2>
          <div className="space-y-4">
            {/* Nombre del rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Rol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_rol"
                value={formData.nombre_rol}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#032dff]/80 ${
                  errors.nombre_rol ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Administrador, Supervisor, Operador"
              />
              {errors.nombre_rol && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <IconAlertCircle size={16} />
                  {errors.nombre_rol}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                El nombre debe ser descriptivo y único
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#032dff]/80 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe las responsabilidades y alcance de este rol..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <IconAlertCircle size={16} />
                  {errors.descripcion}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Máximo 500 caracteres. {formData.descripcion?.length || 0}/500
              </p>
            </div>
          </div>
        </div>

        {/* Información sobre permisos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IconShieldCheck size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                Gestión de permisos
              </p>
              <p className="text-sm text-blue-800">
                Para modificar los permisos de este rol, guarda los cambios y luego usa el 
                botón "Gestionar permisos" desde el listado de roles o desde la página de detalle.
              </p>
              {rol.permisos && rol.permisos.length > 0 && (
                <p className="text-sm text-blue-800 mt-2">
                  Este rol tiene actualmente <strong>{rol.permisos.length}</strong> permiso(s) asignado(s).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de usuarios */}
        {rol.usuarios_count !== undefined && rol.usuarios_count > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconAlertCircle size={20} className="text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-yellow-900 font-medium mb-1">
                  Usuarios afectados
                </p>
                <p className="text-sm text-yellow-800">
                  Este rol está asignado a <strong>{rol.usuarios_count}</strong> usuario(s). 
                  Los cambios en el rol afectarán a todos ellos inmediatamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/roles')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default RolEditarPage;
