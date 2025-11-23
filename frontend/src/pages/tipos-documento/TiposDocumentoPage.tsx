import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconSearch,
  IconFileText
} from '@tabler/icons-react';
import { 
  PageContainer, 
  PageHeader, 
  DataTable,
  ConfirmDialog 
} from '@/components/ui';
import { tipoDocumentoService } from '@/services';
import { useAuth } from '@/auth';
import { useToast } from '@/components/ui/use-toast';

const TiposDocumentoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const { data: tipos = [], isLoading } = useQuery({
    queryKey: ['tiposDocumento'],
    queryFn: tipoDocumentoService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: tipoDocumentoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposDocumento'] });
      toast({
        title: 'Tipo de documento eliminado',
        description: 'El tipo de documento ha sido eliminado correctamente',
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el tipo de documento',
        variant: 'destructive',
      });
      setDeleteId(null);
    },
  });

  const filteredTipos = Array.isArray(tipos) 
    ? tipos.filter((tipo: any) => 
        tipo.nombre_tipo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'nombre_tipo',
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => navigate(`/tipos-documento/${info.row.original.id_tipo_documento}/editar`)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                <IconPencil size={18} />
              </button>
              <button
                onClick={() => setDeleteId(info.row.original.id_tipo_documento)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar"
              >
                <IconTrash size={18} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tipos de Documento"
        description="Gestión de tipos de documentos del sistema"
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        actionButtons={
          isAdmin ? [{
            label: 'Nuevo Tipo',
            icon: <IconPlus size={20} />,
            onClick: () => navigate('/tipos-documento/nuevo'),
          }] : undefined
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar tipos de documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <DataTable
          data={filteredTipos}
          columns={columns}
          isLoading={isLoading}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Eliminar Tipo de Documento"
        message="¿Está seguro que desea eliminar este tipo de documento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
};

export default TiposDocumentoPage;
