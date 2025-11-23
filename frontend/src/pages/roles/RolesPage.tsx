/**
 * Roles Page
 * Página principal de gestión de roles
 * UPDATED: Using DataTable and Badge components
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
import { PageContainer, PageHeader, Badge, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
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
      const data = await roleService.getAll();
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
      await roleService.delete(roleToDelete.id_rol);
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

  // Columns configuration
  const columns: Column<Rol>[] = [
    {
      header: 'Rol',
      accessorKey: 'nombre_rol',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10 bg-[#3f37c9]/10 rounded-lg flex items-center justify-center">
            <IconShieldCheck className="h-5 w-5 text-[#3f37c9]" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.original.nombre_rol}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Descripción',
      accessorKey: 'descripcion',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-md truncate">
          {row.original.descripcion || '-'}
        </div>
      ),
    },
    {
      header: 'Usuarios',
      accessorKey: 'usuarios_count',
      align: 'center',
      sortable: true,
      cell: ({ row }) => (
        <Badge variant="info" icon={<IconUsers size={14} />}>
          {row.original.usuarios_count || 0}
        </Badge>
      ),
    },
    {
      header: 'Permisos',
      accessorKey: 'permisos_count',
      align: 'center',
      sortable: true,
      cell: ({ row }) => (
        <Badge variant="primary" icon={<IconShieldCheck size={14} />}>
          {row.original.permisos_count || 0}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      id: 'acciones',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/roles/${row.original.id_rol}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <IconEye size={18} />
          </button>

          {canAdmin && (
            <>
              <button
                onClick={() => navigate(`/roles/${row.original.id_rol}/editar`)}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Editar rol"
              >
                <IconEdit size={18} />
              </button>

              <button
                onClick={() => navigate(`/roles/${row.original.id_rol}/permisos`)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Gestionar permisos"
              >
                <IconShieldCheck size={18} />
              </button>

              <button
                onClick={() => handleDeleteClick(row.original)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar rol"
              >
                <IconTrash size={18} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading && roles.length === 0) {
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
          label: "Nuevo Rol",
          icon: <IconPlus size={18} />,
          onClick: () => navigate('/roles/nuevo'),
          variant: "primary",
        }] : undefined}
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4">
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

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredRoles}
          isLoading={loading}
          emptyMessage={searchTerm ? 'No se encontraron roles' : 'No hay roles registrados'}
        />

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
