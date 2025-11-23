import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, Button, Input, Card, CardBody } from '@/components/ui';
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
    if (!formData.nombre_tipo.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre del tipo es requerido',
        variant: 'destructive',
      });
      return;
    }
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
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando tipo de documento...</p>
          </div>
        </div>
      </PageContainer>
    );
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
        <Card className="max-w-2xl">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nombre_tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Tipo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="nombre_tipo"
                  name="nombre_tipo"
                  value={formData.nombre_tipo}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Ej: Resolución, Memorando, Informe"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingrese un nombre descriptivo para el tipo de documento
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  isLoading={updateMutation.isPending}
                  startIcon={<IconDeviceFloppy size={18} />}
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tipos-documento')}
                  startIcon={<IconArrowLeft size={18} />}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default TipoDocumentoEditarPage;
