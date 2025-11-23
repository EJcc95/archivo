import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconDeviceFloppy, IconTransfer } from '@tabler/icons-react';
import { prestamoService } from '@/services/prestamoService';
import { archivadorService } from '@/services/archivadorService';
import { areaService } from '@/services/areaService';
import { PageContainer, PageHeader, SearchableSelect } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import type { Archivador, Area } from '@/types/models';

const PrestamoNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [archivadores, setArchivadores] = useState<Archivador[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [formData, setFormData] = useState({
    id_archivador: '',
    id_area_solicitante: '',
    fecha_devolucion_esperada: '',
    motivo: '',
    observaciones: ''
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [archivadoresData, areasData] = await Promise.all([
        archivadorService.getAll(),
        areaService.getAll()
      ]);
      // Filter only available archivadores (not deleted)
      setArchivadores(archivadoresData.filter((a: Archivador) => !a.eliminado));
      setAreas(areasData.filter((a: Area) => a.estado));
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar opciones',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.id_archivador || !formData.id_area_solicitante || !formData.fecha_devolucion_esperada || !formData.motivo) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor complete los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    // Validate that IDs are valid numbers
    const archivadorId = Number(formData.id_archivador);
    const areaId = Number(formData.id_area_solicitante);
    
    if (isNaN(archivadorId) || archivadorId <= 0 || isNaN(areaId) || areaId <= 0) {
      toast({
        title: 'Error de validación',
        description: 'Por favor seleccione un archivador y un área válidos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await prestamoService.create({
        id_archivador: archivadorId,
        id_area_solicitante: areaId,
        fecha_devolucion_esperada: formData.fecha_devolucion_esperada,
        motivo: formData.motivo,
        observaciones: formData.observaciones
      });
      toast({
        title: 'Préstamo registrado',
        description: 'El préstamo ha sido registrado correctamente',
      });
      navigate('/prestamos');
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Error',
        description: 'Error al registrar el préstamo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Préstamo"
        description="Registrar la salida de un archivador"
        icon={<IconTransfer size={28} className="text-white" strokeWidth={2} />}
        backButton={{ onClick: () => navigate('/prestamos'), label: 'Volver' }}
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Información del Préstamo</h3>
              <p className="text-sm text-gray-600 mt-1">Complete los datos del préstamo del archivador</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Archivador */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivador <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={archivadores.map((arch) => ({
                      value: arch.id_archivador,
                      label: `${arch.nombre_archivador} - ${arch.descripcion || 'Sin descripción'}`,
                    }))}
                    value={formData.id_archivador}
                    onChange={(value) => setFormData({ ...formData, id_archivador: String(value) })}
                    placeholder="Seleccione un archivador"
                  />
                </div>

                {/* Área Solicitante */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área Solicitante <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={areas.map((area) => ({
                      value: area.id_area,
                      label: area.nombre_area,
                    }))}
                    value={formData.id_area_solicitante}
                    onChange={(value) => setFormData({ ...formData, id_area_solicitante: String(value) })}
                    placeholder="Seleccione el área solicitante"
                  />
                </div>

                {/* Fecha Devolución */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Devolución Esperada <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_devolucion_esperada}
                    onChange={(e) => setFormData({ ...formData, fecha_devolucion_esperada: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3f37c9] focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3f37c9] focus:border-transparent"
                    placeholder="Ej: Auditoría externa, revisión legal..."
                    required
                  />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3f37c9] focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Detalles adicionales del préstamo..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/prestamos')}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#3f37c9] rounded-lg hover:bg-[#3730a3] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy size={20} />
                      Registrar Préstamo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrestamoNuevoPage;
