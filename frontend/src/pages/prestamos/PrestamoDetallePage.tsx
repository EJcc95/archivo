import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconCheck } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import { PageContainer, PageHeader, Card, CardHeader, CardBody, CardFooter, Button, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

const PrestamoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('prestamos_editar');

  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnObservaciones, setReturnObservaciones] = useState('');

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

  const handleReturn = async () => {
    if (!prestamo) return;
    try {
      await prestamoService.returnPrestamo(prestamo.id_prestamo, {
        observaciones: returnObservaciones
      });
      toast({
        title: 'Éxito',
        description: 'Préstamo marcado como devuelto',
        variant: 'default',
      });
      setReturnModalOpen(false);
      loadPrestamo(prestamo.id_prestamo);
    } catch (error) {
      console.error('Error returning loan:', error);
      toast({
        title: 'Error',
        description: 'Error al registrar devolución',
        variant: 'destructive',
      });
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
        title={`Préstamo #${prestamo.id_prestamo}`}
        description="Detalles del préstamo"
        backButton={{ onClick: () => navigate('/prestamos'), label: 'Volver' }}
        actionButton={
          (canEdit && prestamo.estado === 'Activo') ? (
            <Button 
              onClick={() => setReturnModalOpen(true)} 
              startIcon={<IconCheck size={20} />}
            >
              Registrar Devolución
            </Button>
          ) : undefined
        }
      />
<div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Información del Préstamo"
              subtitle={`Préstamo #${prestamo.id_prestamo}`}
            />
            <CardBody>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <div className="mt-2">
                      <Badge variant={
                        prestamo.estado === 'Activo' ? 'primary' :
                        prestamo.estado === 'Devuelto' ? 'success' :
                        'error'
                      }>
                        {prestamo.estado}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha Préstamo</p>
                    <p className="font-medium mt-1">{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Devolución Esperada</p>
                    <p className="font-medium mt-1">{new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString()}</p>
                  </div>
                  {prestamo.fecha_devolucion_real && (
                    <div>
                      <p className="text-sm text-gray-500">Devolución Real</p>
                      <p className="font-medium mt-1">{new Date(prestamo.fecha_devolucion_real).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-500">Motivo</p>
                  <p className="font-medium mt-2 text-gray-700">{prestamo.motivo}</p>
                </div>

                {prestamo.observaciones && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-500">Observaciones</p>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">{prestamo.observaciones}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Related Info Cards */}
        <div className="space-y-6">
          {/* Archivador Card */}
          <Card>
            <CardHeader title="Archivador Prestado" />
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium mt-1">{prestamo.Archivador?.nombre_archivador}</p>
                </div>
                {prestamo.Archivador?.descripcion && (
                  <div>
                    <p className="text-sm text-gray-500">Descripción</p>
                    <p className="text-gray-700 mt-1">{prestamo.Archivador.descripcion}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Area Solicitante Card */}
          <Card>
            <CardHeader title="Área Solicitante" />
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Área</p>
                  <p className="font-medium mt-1">{prestamo.areaSolicitante?.nombre_area}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
</div>
      {/* Return Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader 
              title="Registrar Devolución"
            />
            <CardBody>
              <div className="space-y-4">
                <p className="text-gray-600">¿Confirmas que el archivador ha sido devuelto?</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones de Devolución (Opcional)
                  </label>
                  <textarea
                    value={returnObservaciones}
                    onChange={(e) => setReturnObservaciones(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-[#032DFF]"
                    rows={3}
                    placeholder="Estado del archivador, notas..."
                  />
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button variant="secondary" onClick={() => setReturnModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReturn}>
                Confirmar Devolución
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default PrestamoDetallePage;
