/**
 * Usuarios Page
 * Lista y gestión de usuarios del sistema
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUsers, IconPlus, IconEdit, IconTrash, IconSearch, IconKey } from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination, SearchableSelect } from '@/components/ui';
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
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => userService.resetPassword(userId),
    onSuccess: () => {
      toast({
        title: 'Contraseña restablecida',
        description: 'Se ha enviado un correo electrónico al usuario con la nueva contraseña',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo restablecer la contraseña',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleResetPassword = (id: number, nombreUsuario: string) => {
    if (window.confirm(`¿Estás seguro de restablecer la contraseña de "${nombreUsuario}"? Se enviará una nueva contraseña por email.`)) {
      resetPasswordMutation.mutate(id);
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
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-[42px]"
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

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || filterEstado ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user: any) => (
                  <tr key={user.id_usuario} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.nombre_usuario}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {user.nombres} {user.apellidos}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {user.Rol?.nombre_rol || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {user.Area?.nombre_area || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.estado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/usuarios/${user.id_usuario}/editar`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id_usuario, user.nombre_usuario)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Restablecer contraseña"
                        >
                          <IconKey size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id_usuario, user.nombre_usuario)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
    </PageContainer>
  );
};

export default UsuariosPage;
