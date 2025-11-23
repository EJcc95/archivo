import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import { PageContainer, PageHeader, FormField, Card, CardHeader, CardBody, CardFooter, Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';

const PrestamoEditarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);

  const [formData, setFormData] = useState({
    fecha_devolucion_esperada: '',
    motivo: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (id) {
      loadPrestamo(Number(id));
    }
  }, [id]);

  const loadPrestamo = async (prestamoId: number) => {
    try {
      setLoading(true);
      const data = await prestamoService.getById(prestamoId);
      setPrestamo(data);
      setFormData({
        fecha_devolucion_esperada: data.fecha_devolucion_esperada,
        motivo: data.motivo,
        observaciones: data.observaciones || ''
      });
    } catch (error) {
      console.error('Error loading loan:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el préstamo',
        variant: 'destructive',
      });
      navigate('/prestamos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestamo) return;

    const newErrors: Record<string, string> = {};

    if (!formData.fecha_devolucion_esperada?.trim()) {
      newErrors.fecha_devolucion_esperada = 'La fecha de devolución esperada es requerida';
    }
    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: 'Errores de validación',
        description: 'Por favor corrija los errores antes de continuar',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await prestamoService.update(Number(id), {
        fecha_devolucion_esperada: formData.fecha_devolucion_esperada,
        motivo: formData.motivo,
        observaciones: formData.observaciones
      });
      toast({
        title: 'Éxito',
        description: 'Préstamo actualizado exitosamente',
        variant: 'default',
      });
      navigate('/prestamos');
    } catch (error) {
      console.error('Error updating loan:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el préstamo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!prestamo) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Editar Préstamo"
        description={`Editando préstamo #${prestamo.id_prestamo}`}
        backButton={{ onClick: () => navigate('/prestamos'), label: 'Volver' }}
        icon={<IconDeviceFloppy size={28} className="text-white" strokeWidth={2} />}
        
      />
      <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader
            title="Información del Préstamo"
            subtitle={`Editando préstamo #${prestamo.id_prestamo}`}
          />
          
          <CardBody>
            {/* Read-only Info Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Archivador</p>
                <p className="font-medium">{prestamo.Archivador?.nombre_archivador}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha Préstamo</p>
                <p className="font-medium">{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Área Solicitante</p>
                <p className="font-medium">{prestamo.areaSolicitante?.nombre_area}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado Actual</p>
                <p className="font-medium">{prestamo.estado}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-6">
              <FormField
                label="Fecha Devolución Esperada"
                required
                error={errors.fecha_devolucion_esperada}
              >
                <input
                  type="date"
                  value={formData.fecha_devolucion_esperada}
                  onChange={(e) => handleChange('fecha_devolucion_esperada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-[#032DFF]"
                />
              </FormField>

              <FormField
                label="Motivo del Préstamo"
                required
                error={errors.motivo}
              >
                <textarea
                  value={formData.motivo}
                  onChange={(e) => handleChange('motivo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-[#032DFF]"
                  rows={3}
                  placeholder="Ingrese el motivo del préstamo"
                />
              </FormField>

              <FormField
                label="Observaciones"
                error={errors.observaciones}
              >
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-[#032DFF]"
                  rows={3}
                  placeholder="Ingrese observaciones adicionales"
                />
              </FormField>
            </div>
          </CardBody>

          <CardFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/prestamos')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={<IconDeviceFloppy size={20} />}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      </div>
    </PageContainer>
  );
};

export default PrestamoEditarPage;
