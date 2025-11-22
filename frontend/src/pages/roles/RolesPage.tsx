/**
 * Roles Page
 * Página principal de gestión de roles
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react';
import { roleService } from '@/services/roleService';
import type { Rol } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const RolesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Permisos
  const canRead = hasPermission('users_admin'); // Requiere users_admin para ver roles
  const canAdmin = hasPermission('users_admin'); // Requiere users_admin para administrar roles

  // Estados
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Rol | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar roles
  useEffect(() => {
    if (!canRead) {
      toast.error('No tienes permisos para ver los roles');
      navigate('/dashboard');
      return;
    }
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar roles por búsqueda
  const filteredRoles = roles.filter((rol) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rol.nombre_rol.toLowerCase().includes(searchLower) ||
      rol.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  // Manejar eliminación
  const handleDeleteClick = (rol: Rol) => {
    setRoleToDelete(rol);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      setDeleting(true);
      await roleService.deleteRole(roleToDelete.id_rol);
      toast.success(`Rol "${roleToDelete.nombre_rol}" eliminado exitosamente`);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar el rol');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3f37c9]"></div>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Roles y Permisos"
        description="Gestiona los roles y sus permisos en el sistema"
        icon={<IconShieldCheck  size={32} className="text-white" strokeWidth={1.5} />}
        actionButtons={canAdmin ? [{
          id: "crear-rol",
          label: "Nuevo Rol",
          icon: <IconPlus size={18} />,
          onClick: () => navigate('/roles/nuevo'),
          variant: "primary" as const,
        }] : []}
      />

      <div className="p-6 lg:p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f37c9]/20"
            />
          </div>
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <IconShieldCheck size={48} className="mb-2 opacity-50" />
                      <p className="text-lg font-medium">No se encontraron roles</p>
                      <p className="text-sm">
                        {searchTerm
                          ? 'Intenta con otros términos de búsqueda'
                          : 'Crea tu primer rol para comenzar'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((rol) => (
                  <tr key={rol.id_rol} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-[#3f37c9]/10 rounded-lg flex items-center justify-center">
                          <IconShieldCheck className="h-5 w-5 text-[#3f37c9]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {rol.nombre_rol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {rol.descripcion || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <IconUsers size={14} />
                        {rol.usuarios_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <IconShieldCheck size={14} />
                        {rol.permisos_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        {/* Ver detalle */}
                        <button
                          onClick={() => navigate(`/roles/${rol.id_rol}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver detalle"
                        >
                          <IconEye size={18} />
                        </button>

                        {canAdmin && (
                          <>
                            {/* Editar */}
                            <button
                              onClick={() => navigate(`/roles/${rol.id_rol}/editar`)}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors"
                              title="Editar rol"
                            >
                              <IconEdit size={18} />
                            </button>

                            {/* Asignar permisos */}
                            <button
                              onClick={() => navigate(`/roles/${rol.id_rol}/permisos`)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Gestionar permisos"
                            >
                              <IconShieldCheck size={18} />
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => handleDeleteClick(rol)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar rol"
                            >
                              <IconTrash size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{filteredRoles.length}</span> de{' '}
            <span className="font-medium">{roles.length}</span> roles
          </p>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Rol"
        message={
          <div className="space-y-2">
            <p>
              ¿Estás seguro de que deseas eliminar el rol <strong>{roleToDelete?.nombre_rol}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. El rol solo se puede eliminar si no tiene usuarios asignados.
            </p>
          </div>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleting}
      />
      </div>
    </PageContainer>
  );
};

export default RolesPage;
