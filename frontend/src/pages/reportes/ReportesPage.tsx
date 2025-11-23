import { useState, useEffect } from 'react';
import { 
  IconChartBar, 
  IconFileText, 
  IconUsers, 
  IconBuildingSkyscraper, 
  IconFolders 
} from '@tabler/icons-react';
import { reportService, type DashboardStats, type ChartData } from '@/services/reportService';
import { PageContainer, PageHeader, Card, CardHeader, CardBody } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';

const ReportesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [docsByArea, setDocsByArea] = useState<ChartData[]>([]);
  const [docsByTipo, setDocsByTipo] = useState<ChartData[]>([]);
  const [docsByEstado, setDocsByEstado] = useState<ChartData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, areaData, tipoData, estadoData] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getDocumentosByArea(),
        reportService.getDocumentosByTipo(),
        reportService.getDocumentosByEstado()
      ]);

      setStats(statsData);
      setDocsByArea(areaData);
      setDocsByTipo(tipoData);
      setDocsByEstado(estadoData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los reportes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-lg ${color} text-white`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const SimpleBarChart = ({ data, title }: { data: ChartData[], title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <Card>
        <CardHeader title={title} />
        <CardBody>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#032DFF] rounded-full transition-all duration-500"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032DFF]"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Reportes y Estadísticas"
        description="Visualización general del estado del sistema"
        icon={<IconChartBar  size={28} className="text-white" strokeWidth={2} />}
      />
      <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Documentos" 
          value={stats?.total_documentos || 0} 
          icon={<IconFileText size={24} />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Usuarios Activos" 
          value={stats?.total_usuarios || 0} 
          icon={<IconUsers size={24} />}
          color="bg-green-500"
        />
        <StatCard 
          title="Áreas Registradas" 
          value={stats?.total_areas || 0} 
          icon={<IconBuildingSkyscraper size={24} />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Archivadores" 
          value={stats?.total_archivadores || 0} 
          icon={<IconFolders size={24} />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          title="Documentos por Área" 
          data={docsByArea} 
        />
        <SimpleBarChart 
          title="Documentos por Tipo" 
          data={docsByTipo} 
        />
        <SimpleBarChart 
          title="Estado de Documentos" 
          data={docsByEstado} 
        />
      </div>
      </div>
    </PageContainer>
  );
};

export default ReportesPage;
