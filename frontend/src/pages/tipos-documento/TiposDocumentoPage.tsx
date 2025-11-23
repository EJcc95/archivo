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
  ConfirmModal,
  Button,
  Input
} from '@/components/ui';
import { tipoDocumentoService } from '@/services';
import { useAuth } from '@/auth';
import { useToast } from '@/components/ui/use-toast';
import type { Column } from '@/components/ui/DataTable';

interface TipoDocumento {
  id_tipo_documento: number;
  nombre_tipo: string;
}

const TiposDocumentoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isAdmin = user?.rol === 'Administrador' || user?.rol === 'Administrador';

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

  const columns: Column<TipoDocumento>[] = [
    {
      header: 'Nombre del Tipo',
      accessorKey: 'nombre_tipo',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.nombre_tipo}</span>
      )
    },
    ...(isAdmin ? [{
      header: 'Acciones',
      id: 'actions',
      align: 'right' as const,
      cell: ({ row }: { row: { original: TipoDocumento } }) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tipos-documento/${row.original.id_tipo_documento}/editar`);
            }}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <IconPencil size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.original.id_tipo_documento);
            }}
            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    }] : [])
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tipos de Documento"
        description="Gestión de tipos de documentos del sistema"
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        actionButton={
          isAdmin ? (
            <Button 
              onClick={() => navigate('/tipos-documento/nuevo')}
              startIcon={<IconPlus size={20} className="text-[#0A36CC]" />}
              className="bg-white text-[#0A36CC] hover:bg-gray-50 border border-gray-200"
            >
              Nuevo Tipo
            </Button>
          ) : undefined
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar tipos de documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <DataTable
          data={filteredTipos}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No hay tipos de documento registrados"
        />
      </div>

      <ConfirmModal
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
