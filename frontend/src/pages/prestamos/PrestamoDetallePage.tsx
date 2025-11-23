import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconCheck } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
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
      toast.error('Error al cargar el préstamo');
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
      toast.success('Préstamo marcado como devuelto');
      setReturnModalOpen(false);
      loadPrestamo(prestamo.id_prestamo);
    } catch (error) {
      console.error('Error returning loan:', error);
      toast.error('Error al registrar devolución');
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
              variant="primary" // Changed from success to primary as success might not exist in Button component
              className="bg-green-600 hover:bg-green-700" // Override color manually
            >
              Registrar Devolución
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">
            Información del Préstamo
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                ${prestamo.estado === 'Activo' ? 'bg-blue-100 text-blue-800' : 
                  prestamo.estado === 'Devuelto' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}`}>
                {prestamo.estado}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Préstamo</p>
              <p className="font-medium">{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Devolución Esperada</p>
              <p className="font-medium">{new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString()}</p>
            </div>
            {prestamo.fecha_devolucion_real && (
              <div>
                <p className="text-sm text-gray-500">Devolución Real</p>
                <p className="font-medium">{new Date(prestamo.fecha_devolucion_real).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500">Motivo</p>
            <p className="font-medium mt-1">{prestamo.motivo}</p>
          </div>

          {prestamo.observaciones && (
            <div>
              <p className="text-sm text-gray-500">Observaciones</p>
              <p className="text-gray-700 mt-1 whitespace-pre-line">{prestamo.observaciones}</p>
            </div>
          )}
        </div>

        {/* Related Info */}
        <div className="space-y-6">
          {/* Archivador Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">
              Archivador Prestado
            </h3>
            <div className="space-y-2">
              <p><span className="text-gray-500">Nombre:</span> <span className="font-medium">{prestamo.Archivador?.nombre_archivador}</span></p>
              <p><span className="text-gray-500">Descripción:</span> <span className="font-medium">{prestamo.Archivador?.descripcion}</span></p>
            </div>
          </div>

          {/* Solicitante Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">
              Solicitante
            </h3>
            <div className="space-y-2">
              <p><span className="text-gray-500">Nombre:</span> <span className="font-medium">{prestamo.solicitante?.nombres} {prestamo.solicitante?.apellidos}</span></p>
              <p><span className="text-gray-500">Usuario:</span> <span className="font-medium">{prestamo.solicitante?.nombre_usuario}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Devolución</h3>
              <button onClick={() => setReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600">¿Confirmas que el archivador ha sido devuelto?</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones de Devolución (Opcional)
                </label>
                <textarea
                  value={returnObservaciones}
                  onChange={(e) => setReturnObservaciones(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Estado del archivador, notas..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setReturnModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleReturn}>Confirmar Devolución</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PrestamoDetallePage;
