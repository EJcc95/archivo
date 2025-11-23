import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { prestamoService, type Prestamo } from '@/services/prestamoService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

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
      toast.error('Error al cargar el préstamo');
      navigate('/prestamos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      await prestamoService.update(Number(id), formData);
      toast.success('Préstamo actualizado correctamente');
      navigate('/prestamos');
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error('Error al actualizar el préstamo');
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
        icon={<IconDeviceFloppy size={24} />}
      />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          
          {/* Read-only Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Archivador</p>
              <p className="font-medium">{prestamo.Archivador?.nombre_archivador}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Solicitante</p>
              <p className="font-medium">{prestamo.solicitante?.nombres} {prestamo.solicitante?.apellidos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Préstamo</p>
              <p className="font-medium">{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado Actual</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                ${prestamo.estado === 'Activo' ? 'bg-blue-100 text-blue-800' : 
                  prestamo.estado === 'Devuelto' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}`}>
                {prestamo.estado}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Devolución Esperada
                </label>
                <input
                  type="date"
                  value={formData.fecha_devolucion_esperada}
                  onChange={(e) => setFormData({ ...formData, fecha_devolucion_esperada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del Préstamo
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                className="mr-3"
                onClick={() => navigate('/prestamos')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                startIcon={<IconDeviceFloppy size={20} />}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrestamoEditarPage;
