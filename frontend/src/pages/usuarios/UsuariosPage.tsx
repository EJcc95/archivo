/**
 * Usuarios Page
 * Lista y gestión de usuarios del sistema
 * UPDATED: Using DataTable and Badge components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUsers, IconPlus, IconEdit, IconTrash, IconSearch, IconKey } from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination, SearchableSelect, Badge, DataTable, ConfirmModal } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { userService } from '@/services';
import { useAuth } from '@/auth';
import { useToast } from '@/components/ui/use-toast';

const UsuariosPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string | number>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [resetPwdUserId, setResetPwdUserId] = useState<number | null>(null);
  const [resetPwdUserName, setResetPwdUserName] = useState('');
  const itemsPerPage = 25;

  const isAdmin = currentUser?.rol === 'Administrador';

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    enabled: isAdmin,
  });

  const users = Array.isArray(usersData) ? usersData : (usersData?.users && Array.isArray(usersData.users) ? usersData.users : []);

  // Estado options
  const estadoOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 1, label: 'Activo' },
    { value: 0, label: 'Inactivo' },
  ];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente',
      });
      setDeleteUserId(null);
      setDeleteUserName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
      setDeleteUserId(null);
      setDeleteUserName('');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => userService.resetPassword(userId),
    onSuccess: () => {
      toast({
        title: 'Contraseña restablecida',
        description: 'Se ha enviado un correo electrónico al usuario con la nueva contraseña',
      });
      setResetPwdUserId(null);
      setResetPwdUserName('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo restablecer la contraseña',
        variant: 'destructive',
      });
      setResetPwdUserId(null);
      setResetPwdUserName('');
    },
  });

  const handleDelete = (id: number, nombre: string) => {
    setDeleteUserId(id);
    setDeleteUserName(nombre);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  const handleResetPassword = (id: number, nombreUsuario: string) => {
    setResetPwdUserId(id);
    setResetPwdUserName(nombreUsuario);
  };

  const confirmResetPassword = () => {
    if (resetPwdUserId) {
      resetPasswordMutation.mutate(resetPwdUserId);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !filterEstado || (filterEstado === 1 ? user.estado : !user.estado);

    return matchesSearch && matchesEstado;
  });

  // Paginate
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Columns configuration
  const columns: Column<any>[] = [
    {
      header: 'Usuario',
      accessorKey: 'nombre_usuario',
      sortable: true,
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.nombre_usuario}</div>
      ),
    },
    {
      header: 'Nombre Completo',
      id: 'nombre_completo',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.nombres} {row.original.apellidos}
        </span>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.email}</span>
      ),
    },
    {
      header: 'Rol',
      accessorKey: 'Rol',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.Rol?.nombre_rol || '-'}
        </span>
      ),
    },
    {
      header: 'Área',
      accessorKey: 'Area',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.Area?.nombre_area || '-'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant={row.original.estado ? 'success' : 'error'}>
          {row.original.estado ? 'Activo' : 'Inactivo'}
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
            onClick={() => navigate(`/usuarios/${row.original.id_usuario}/editar`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <IconEdit size={18} />
          </button>
          <button
            onClick={() => handleResetPassword(row.original.id_usuario, row.original.nombre_usuario)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Restablecer contraseña"
          >
            <IconKey size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id_usuario, row.original.nombre_usuario)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <PageContainer>
        <div className="p-6 text-center text-gray-500">
          No tienes permisos para acceder a esta sección
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        icon={<IconUsers size={28} className="text-white" strokeWidth={2} />}
        actionButtons={[
          {
            label: 'Nuevo Usuario',
            onClick: () => navigate('/usuarios/nuevo'),
            icon: <IconPlus size={18} />,
            variant: 'primary',
          },
        ]}
      />

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por usuario, nombre o email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
            />
          </div>

          <div className="w-full lg:w-48">
            <SearchableSelect
              options={estadoOptions}
              value={filterEstado}
              onChange={(val: string | number) => { setFilterEstado(val); handleFilterChange(); }}
              placeholder="Todos los estados"
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedUsers}
          isLoading={isLoading}
          emptyMessage={searchTerm || filterEstado ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          rowClassName={(row) => !row.estado ? 'opacity-75' : ''}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
          />
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => {
          setDeleteUserId(null);
          setDeleteUserName('');
        }}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar al usuario "${deleteUserName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Confirm Reset Password Modal */}
      <ConfirmModal
        isOpen={!!resetPwdUserId}
        onClose={() => {
          setResetPwdUserId(null);
          setResetPwdUserName('');
        }}
        onConfirm={confirmResetPassword}
        title="Restablecer Contraseña"
        message={`¿Estás seguro de restablecer la contraseña de "${resetPwdUserName}"? Se enviará una nueva contraseña por email.`}
        confirmText="Restablecer Contraseña"
        cancelText="Cancelar"
        confirmVariant="primary"
        isLoading={resetPasswordMutation.isPending}
      />
    </PageContainer>
  );
};

export default UsuariosPage;

