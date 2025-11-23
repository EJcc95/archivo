import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { prestamoService } from '@/services/prestamoService';
import { archivadorService } from '@/services/archivadorService';
import { userService } from '@/services/userService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import type { Archivador, Usuario } from '@/types/models';

const PrestamoNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [archivadores, setArchivadores] = useState<Archivador[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [formData, setFormData] = useState({
    id_archivador: '',
    id_usuario_solicitante: '',
    fecha_devolucion_esperada: '',
    motivo: '',
    observaciones: ''
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [archivadoresData, usuariosData] = await Promise.all([
        archivadorService.getAll(),
        userService.getAll()
      ]);
      // Filter only available archivadores (not deleted, maybe check status if backend supported it)
      setArchivadores(archivadoresData.filter((a: Archivador) => !a.eliminado));
      setUsuarios(usuariosData.filter((u: Usuario) => u.estado));
    } catch (error) {
      console.error('Error loading options:', error);
      toast.error('Error al cargar opciones');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_archivador || !formData.id_usuario_solicitante || !formData.fecha_devolucion_esperada || !formData.motivo) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      await prestamoService.create({
        id_archivador: Number(formData.id_archivador),
        id_usuario_solicitante: Number(formData.id_usuario_solicitante),
        fecha_devolucion_esperada: formData.fecha_devolucion_esperada,
        motivo: formData.motivo,
        observaciones: formData.observaciones
      });
      toast.success('Préstamo registrado correctamente');
      navigate('/prestamos');
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error('Error al registrar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Préstamo"
        description="Registrar la salida de un archivador"
        backButton={{ onClick: () => navigate('/prestamos'), label: 'Volver' }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivador *
                </label>
                <select
                  value={formData.id_archivador}
                  onChange={(e) => setFormData({ ...formData, id_archivador: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccione un archivador</option>
                  {archivadores.map((arch) => (
                    <option key={arch.id_archivador} value={arch.id_archivador}>
                      {arch.nombre_archivador} - {arch.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solicitante *
                </label>
                <select
                  value={formData.id_usuario_solicitante}
                  onChange={(e) => setFormData({ ...formData, id_usuario_solicitante: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccione un usuario</option>
                  {usuarios.map((user) => (
                    <option key={user.id_usuario} value={user.id_usuario}>
                      {user.nombres} {user.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Devolución Esperada *
                </label>
                <input
                  type="date"
                  value={formData.fecha_devolucion_esperada}
                  onChange={(e) => setFormData({ ...formData, fecha_devolucion_esperada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Razón del préstamo"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/prestamos')}
                className="mr-3"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                startIcon={<IconDeviceFloppy size={20} />}
              >
                Registrar Préstamo
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrestamoNuevoPage;
