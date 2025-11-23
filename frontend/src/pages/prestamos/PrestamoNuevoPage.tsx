import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconDeviceFloppy, IconTransfer, IconArrowLeft } from '@tabler/icons-react';
import { prestamoService } from '@/services/prestamoService';
import { archivadorService } from '@/services/archivadorService';
import { areaService } from '@/services/areaService';
import { PageContainer, PageHeader, SearchableSelect, FormField, Card, CardHeader, CardBody, CardFooter } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import type { Archivador, Area } from '@/types/models';

const PrestamoNuevoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [archivadores, setArchivadores] = useState<Archivador[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [formData, setFormData] = useState<{
    id_archivador: string | number | undefined;
    id_area_solicitante: string | number | undefined;
    fecha_devolucion_esperada: string;
    motivo: string;
    observaciones: string;
  }>({
    id_archivador: undefined,
    id_area_solicitante: undefined,
    fecha_devolucion_esperada: '',
    motivo: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const newErrors: Record<string, string> = {};
    
    if (!formData.id_archivador) {
      newErrors.id_archivador = 'Debe seleccionar un archivador';
    }
    if (!formData.id_area_solicitante) {
      newErrors.id_area_solicitante = 'Debe seleccionar un área solicitante';
    }
    if (!formData.fecha_devolucion_esperada) {
      newErrors.fecha_devolucion_esperada = 'La fecha de devolución es requerida';
    }
    if (!formData.motivo.trim()) {
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

    // Validate that IDs are valid numbers
    const archivadorId = typeof formData.id_archivador === 'number' 
      ? formData.id_archivador 
      : Number(formData.id_archivador);
    const areaId = typeof formData.id_area_solicitante === 'number'
      ? formData.id_area_solicitante
      : Number(formData.id_area_solicitante);
    
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
    } catch (error: any) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al registrar el préstamo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Préstamo"
        description="Registrar la salida de un archivador"
        icon={<IconTransfer size={28} className="text-white" strokeWidth={2} />}
        backButton={{ onClick: () => navigate('/prestamos'), label: 'Volver a préstamos' }}
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Préstamo */}
            <Card>
              <CardHeader
                title="Información del Préstamo"
                subtitle="Complete los datos del préstamo del archivador"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Archivador */}
                  <FormField
                    label="Archivador"
                    required
                    error={errors.id_archivador}
                  >
                    <SearchableSelect
                      options={archivadores.map((arch) => ({
                        value: arch.id_archivador,
                        label: `${arch.nombre_archivador} - ${arch.descripcion || 'Sin descripción'}`,
                      }))}
                      value={formData.id_archivador}
                      onChange={(value) => handleChange('id_archivador', value)}
                      placeholder="Seleccione un archivador"
                      error={!!errors.id_archivador}
                    />
                  </FormField>

                  {/* Área Solicitante */}
                  <FormField
                    label="Área Solicitante"
                    required
                    error={errors.id_area_solicitante}
                  >
                    <SearchableSelect
                      options={areas.map((area) => ({
                        value: area.id_area,
                        label: area.nombre_area,
                      }))}
                      value={formData.id_area_solicitante}
                      onChange={(value) => handleChange('id_area_solicitante', value)}
                      placeholder="Seleccione el área solicitante"
                      error={!!errors.id_area_solicitante}
                    />
                  </FormField>

                  {/* Fecha Devolución */}
                  <FormField
                    label="Fecha Devolución Esperada"
                    required
                    error={errors.fecha_devolucion_esperada}
                    htmlFor="fecha_devolucion_esperada"
                  >
                    <input
                      type="date"
                      id="fecha_devolucion_esperada"
                      value={formData.fecha_devolucion_esperada}
                      onChange={(e) => handleChange('fecha_devolucion_esperada', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormField>

                  {/* Motivo */}
                  <FormField
                    label="Motivo"
                    required
                    error={errors.motivo}
                    htmlFor="motivo"
                  >
                    <input
                      type="text"
                      id="motivo"
                      value={formData.motivo}
                      onChange={(e) => handleChange('motivo', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent"
                      placeholder="Ej: Auditoría externa, revisión legal..."
                    />
                  </FormField>
                </div>

                {/* Observaciones */}
                <FormField
                  label="Observaciones"
                  htmlFor="observaciones"
                  className="mt-6"
                >
                  <textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#032DFF] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Detalles adicionales del préstamo..."
                  />
                </FormField>
              </CardBody>

              <CardFooter>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#032DFF] text-white rounded-lg hover:bg-[#0225cc] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <IconDeviceFloppy size={18} />
                    {loading ? 'Registrando...' : 'Registrar Préstamo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/prestamos')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    <IconArrowLeft size={18} />
                    Cancelar
                  </button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrestamoNuevoPage;
