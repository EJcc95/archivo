/**
 * Rol Detalle Page
 * Vista detallada de un rol con sus permisos y usuarios
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconShieldCheck,
  IconEdit,
  IconTrash,
  IconUsers,
  IconSettings,
  IconAlertCircle,
} from '@tabler/icons-react';
import { roleService } from '@/services/roleService';
import type { RolConPermisos, RolConUsuarios } from '@/types';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const RolDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Permisos
  const canRead = hasPermission('users_admin');
  const canAdmin = hasPermission('users_admin');

  // Estados
  const [rol, setRol] = useState<RolConPermisos | null>(null);
  const [usuarios, setUsuarios] = useState<RolConUsuarios | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Verificar permisos y cargar datos
  useEffect(() => {
    if (!canRead) {
      toast.error('No tienes permisos para ver los detalles del rol');
      navigate('/roles');
      return;
    }

    if (!id) {
      toast.error('ID de rol no válido');
      navigate('/roles');
      return;
    }

    loadRolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canRead]);

  const loadRolData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [rolData, usuariosData] = await Promise.all([
        roleService.getRoleById(Number(id)),
        roleService.getUsersByRole(Number(id)),
      ]);
      setRol(rolData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error loading rol data:', error);
      toast.error('Error al cargar los datos del rol');
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await roleService.deleteRole(Number(id));
      toast.success('Rol eliminado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar el rol');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Agrupar permisos por categoría
  const agruparPermisosPorCategoria = () => {
    if (!rol?.permisos) return {};
    
    return rol.permisos.reduce((acc, permiso) => {
      const categoria = permiso.nombre_permiso.split('_')[0];
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(permiso);
      return acc;
    }, {} as Record<string, typeof rol.permisos>);
  };

  const permisosPorCategoria = agruparPermisosPorCategoria();

  // Construir botones de acciones dinámicamente
  const actionButtons = useMemo(() => {
    const buttons: any[] = [];

    if (!canAdmin || !id) return buttons;

    // Botón de gestionar permisos
    buttons.push({
      id: "permisos",
      label: "Gestionar Permisos",
      icon: <IconSettings size={18} />,
      onClick: () => navigate(`/roles/${id}/permisos`),
      variant: "secondary" as const,
    });

    // Botón de editar
    buttons.push({
      id: "editar",
      label: "Editar",
      icon: <IconEdit size={18} />,
      onClick: () => navigate(`/roles/${id}/editar`),
      variant: "secondary" as const,
    });

    // Botón de eliminar
    buttons.push({
      id: "eliminar",
      label: "Eliminar",
      icon: <IconTrash size={18} />,
      onClick: handleDeleteClick,
      variant: "danger" as const,
    });

    return buttons;
  }, [canAdmin, id, navigate]);

  if (loading) {
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
        title={rol.nombre_rol}
        description="Información detallada del rol y sus permisos"
        icon={<IconShieldCheck size={32} className="text-white" strokeWidth={1.5} />}
        backButton={{
          onClick: () => navigate('/roles'),
          label: "Roles",
        }}
        actionButtons={actionButtons}
      />

      <div className="p-6 lg:p-8 space-y-6">
          {/* Descripción */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Descripción
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {rol.descripcion || 'Sin descripción'}
            </p>
          </div>

          {/* Permisos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconShieldCheck size={20} />
                Permisos Asignados ({rol.permisos?.length || 0})
              </h2>
              {canAdmin && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/roles/${id}/permisos`)}
                  className="flex items-center gap-1"
                >
                  <IconSettings size={16} />
                  Modificar
                </Button>
              )}
            </div>

            {!rol.permisos || rol.permisos.length === 0 ? (
              <div className="text-center py-8">
                <IconAlertCircle size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  Este rol no tiene permisos asignados
                </p>
                {canAdmin && (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/roles/${id}/permisos`)}
                    className="mt-4"
                  >
                    Asignar Permisos
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(permisosPorCategoria).map(([categoria, permisos]) => (
                  <div key={categoria}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {categoria.replace('_', ' ')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {permisos.map((permiso) => (
                        <span
                          key={permiso.id_permiso}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                          title={permiso.descripcion}
                        >
                          {permiso.nombre_permiso}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usuarios con este rol */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IconUsers size={20} />
              Usuarios con este Rol ({usuarios?.total_usuarios || 0})
            </h2>

            {!usuarios?.usuarios || usuarios.usuarios.length === 0 ? (
              <div className="text-center py-8">
                <IconUsers size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  No hay usuarios asignados a este rol
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {usuarios.usuarios.map((usuario) => (
                  <div
                    key={usuario.id_usuario}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#3f37c9]/10 rounded-lg flex items-center justify-center">
                        <span className="text-[#3f37c9] font-semibold">
                          {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {usuario.nombres} {usuario.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">
                          @{usuario.nombre_usuario} • {usuario.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.estado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => navigate(`/usuarios/${usuario.id_usuario}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver perfil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Estadísticas */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Estadísticas
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <IconShieldCheck size={20} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Permisos
                  </span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {rol.permisos?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <IconUsers size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Usuarios
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {usuarios?.total_usuarios || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia si hay usuarios */}
          {usuarios && usuarios.total_usuarios > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <IconAlertCircle size={20} className="text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Precaución
                  </p>
                  <p className="text-sm text-yellow-800">
                    Este rol está asignado a {usuarios.total_usuarios} usuario(s). 
                    Los cambios en los permisos afectarán inmediatamente a todos ellos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>      

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Rol"
        message={
          <div className="space-y-2">
            <p>
              ¿Estás seguro de que deseas eliminar el rol <strong>{rol.nombre_rol}</strong>?
            </p>
            {usuarios && usuarios.total_usuarios > 0 ? (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Este rol está asignado a {usuarios.total_usuarios} usuario(s). 
                No podrás eliminarlo hasta que reasignes a todos los usuarios a otros roles.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Esta acción no se puede deshacer.
              </p>
            )}
          </div>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleting}
      />
    </PageContainer>
  );
};

export default RolDetallePage;
