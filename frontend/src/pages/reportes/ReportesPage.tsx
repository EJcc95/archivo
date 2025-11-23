/**
 * Reportes Page
 * Página de reportes y estadísticas con gráficos interactivos y descarga PDF
 * UPDATED: Using Recharts for interactive charts and jsPDF for PDF export
 */

import { useState, useEffect } from 'react';
import { 
  IconChartBar, 
  IconFileText, 
  IconUsers, 
  IconBuildingSkyscraper, 
  IconFolders,
  IconDownload,
  IconRefresh
} from '@tabler/icons-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reportService, type DashboardStats, type ChartData } from '@/services/reportService';
import { PageContainer, PageHeader, Card, CardHeader, CardBody } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';

const COLORS = ['#032DFF', '#0A36CC', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

const ReportesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [docsByArea, setDocsByArea] = useState<ChartData[]>([]);
  const [docsByTipo, setDocsByTipo] = useState<ChartData[]>([]);
  const [docsByEstado, setDocsByEstado] = useState<ChartData[]>([]);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(3, 45, 255);
      doc.text('Reporte de Estadísticas', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 28, { align: 'center' });

      // Stats Summary
      let yPosition = 40;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Resumen General', 14, yPosition);
      
      yPosition += 10;
      autoTable(doc, {
        startY: yPosition,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total Documentos', (stats?.total_documentos || 0).toString()],
          ['Usuarios Activos', (stats?.total_usuarios || 0).toString()],
          ['Áreas Registradas', (stats?.total_areas || 0).toString()],
          ['Archivadores', (stats?.total_archivadores || 0).toString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [3, 45, 255] },
        styles: { fontSize: 10 },
      });

      // Documentos por Área
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Documentos por Área', 14, yPosition);
      
      yPosition += 5;
      autoTable(doc, {
        startY: yPosition,
        head: [['Área', 'Cantidad']],
        body: docsByArea.map(item => [item.name, item.value.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [3, 45, 255] },
        styles: { fontSize: 9 },
      });

      // Nueva página si es necesario
      if ((doc as any).lastAutoTable.finalY > 200) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Documentos por Tipo
      doc.setFontSize(14);
      doc.text('Documentos por Tipo', 14, yPosition);
      
      yPosition += 5;
      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo', 'Cantidad']],
        body: docsByTipo.map(item => [item.name, item.value.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [3, 45, 255] },
        styles: { fontSize: 9 },
      });

      // Documentos por Estado
      if ((doc as any).lastAutoTable.finalY > 200) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      doc.setFontSize(14);
      doc.text('Estado de Documentos', 14, yPosition);
      
      yPosition += 5;
      autoTable(doc, {
        startY: yPosition,
        head: [['Estado', 'Cantidad']],
        body: docsByEstado.map(item => [item.name, item.value.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [3, 45, 255] },
        styles: { fontSize: 9 },
      });

      // Save PDF
      doc.save(`reporte-estadisticas-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'Reporte generado',
        description: 'El archivo PDF se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Error al generar el reporte PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${color} text-white shadow-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032DFF]"></div>
          <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Reportes y Estadísticas"
        description="Visualización general del estado del sistema"
        icon={<IconChartBar size={28} className="text-white" strokeWidth={2} />}
        actionButtons={[
          {
            label: 'Actualizar',
            onClick: loadData,
            icon: <IconRefresh size={18} />,
            variant: 'ghost',
          },
          {
            label: isExporting ? 'Generando PDF...' : 'Descargar PDF',
            onClick: exportToPDF,
            icon: <IconDownload size={18} />,
            variant: 'primary',
            disabled: isExporting,
          },
        ]}
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Documentos" 
            value={stats?.total_documentos || 0} 
            icon={<IconFileText size={24} strokeWidth={2} />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard 
            title="Usuarios Activos" 
            value={stats?.total_usuarios || 0} 
            icon={<IconUsers size={24} strokeWidth={2} />}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard 
            title="Áreas Registradas" 
            value={stats?.total_areas || 0} 
            icon={<IconBuildingSkyscraper size={24} strokeWidth={2} />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard 
            title="Archivadores" 
            value={stats?.total_archivadores || 0} 
            icon={<IconFolders size={24} strokeWidth={2} />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documentos por Área - Bar Chart */}
          <Card>
            <CardHeader title="Documentos por Área" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={docsByArea as any[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="value" name="Documentos" fill="#032DFF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Documentos por Tipo - Pie Chart */}
          <Card>
            <CardHeader title="Documentos por Tipo" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={docsByTipo as any[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {docsByTipo.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Estado de Documentos - Bar Chart */}
          <Card>
            <CardHeader title="Estado de Documentos" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={docsByEstado as any[]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="value" name="Cantidad" fill="#1e40af" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader title="Resumen Detallado" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Por Área</h4>
                  <div className="space-y-2">
                    {docsByArea.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Por Estado</h4>
                  <div className="space-y-2">
                    {docsByEstado.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportesPage;
