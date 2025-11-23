import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFileText, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { PageContainer, PageHeader, Button, Input, Card, CardBody } from '@/components/ui';
import { tipoDocumentoService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const TipoDocumentoNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre_tipo: '',
  });

  const createMutation = useMutation({
    mutationFn: tipoDocumentoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposDocumento'] });
      toast({
        title: 'Tipo de documento creado',
        description: 'El tipo de documento ha sido registrado correctamente',
      });
      navigate('/tipos-documento');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el tipo de documento',
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
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Tipo de Documento"
        description="Registrar un nuevo tipo de documento"
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
                  disabled={createMutation.isPending}
                  isLoading={createMutation.isPending}
                  startIcon={<IconDeviceFloppy size={18} />}
                >
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
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

export default TipoDocumentoNuevoPage;
