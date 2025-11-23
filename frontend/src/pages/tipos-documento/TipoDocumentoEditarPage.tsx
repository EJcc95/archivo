import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader } from '@/components/ui';
import { tipoDocumentoService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const TipoDocumentoEditarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_tipo: '',
  });

  const { data: tipo, isLoading } = useQuery({
    queryKey: ['tipoDocumento', id],
    queryFn: () => tipoDocumentoService.getById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (tipo) {
      setFormData({
        nombre_tipo: tipo.nombre_tipo,
      });
    }
  }, [tipo]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => tipoDocumentoService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposDocumento'] });
      queryClient.invalidateQueries({ queryKey: ['tipoDocumento', id] });
      toast({
        title: 'Tipo de documento actualizado',
        description: 'Los cambios han sido guardados correctamente',
      });
      navigate('/tipos-documento');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el tipo de documento',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_tipo.trim()) return;
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar Tipo de Documento"
        description="Modificar información del tipo de documento"
        icon={<IconFileText size={28} className="text-white" strokeWidth={2} />}
        backButton={{
          onClick: () => navigate('/tipos-documento'),
          label: 'Volver a la lista',
        }}
      />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label htmlFor="nombre_tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Tipo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre_tipo"
              name="nombre_tipo"
              value={formData.nombre_tipo}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <IconDeviceFloppy size={18} />
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tipos-documento')}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              <IconArrowLeft size={18} />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default TipoDocumentoEditarPage;
