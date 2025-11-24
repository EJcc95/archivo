/**
 * Dashboard Page
 * Página principal del dashboard con estadísticas reales del backend
 * UPDATED: Interactive charts and modern UI
 */

import { useAuth } from '@/auth';
import { IconFileText, IconUsers, IconFolders, IconArchive, IconSparkles, IconClock, IconActivity, IconChartPie } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui';
import { reportService } from '@/services';
import ArchivoLogo from '@/assets/archivo-logo.png';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#032DFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const DashboardPage = () => {
  const { user } = useAuth();

  // Obtener estadísticas del dashboard
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  // Obtener actividad reciente de auditoría
  const { data: userActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => reportService.getUserActivity({ limit: 4 }),
  });

  // Obtener documentos por área para el gráfico
  const { data: docsByArea } = useQuery({
    queryKey: ['docs-by-area'],
    queryFn: () => reportService.getDocumentosByArea(),
  });

  // Preparar datos para el gráfico de estados
  const pieData = dashboardStats?.documentsByState?.map((item: any) => ({
    name: item.nombre,
    value: item.value
  })) || [];

  // Obtener hora del día para saludo personalizado
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Obtener fecha formateada
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const stats = [
    {
      title: 'Total Documentos',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.total_documentos?.toLocaleString() ?? '0'),
      icon: <IconFileText size={24} className="text-white" strokeWidth={2} />,
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Usuarios Activos',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.total_usuarios?.toString() ?? '0'),
      icon: <IconUsers size={24} className="text-white" strokeWidth={2} />,
      bgGradient: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Áreas',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.total_areas?.toString() ?? '0'),
      icon: <IconFolders size={24} className="text-white" strokeWidth={2} />,
      bgGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
    {
      title: 'Archivadores',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.total_archivadores?.toString() ?? '0'),
      icon: <IconArchive size={24} className="text-white" strokeWidth={2} />,
      bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
  ];

  return (
    <PageContainer>
      {/* Header Minimalista Mejorado */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#032dff] to-[#001b9e] rounded-2xl mx-6 lg:mx-8 mt-6 lg:mt-8 shadow-lg">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNnptMCAyNGMzLjMxIDAgNi0yLjY5IDYtNnMtMi42OS02LTYtNi02IDIuNjktNiA2IDIuNjkgNiA2IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative px-6 lg:px-10 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Sección de bienvenida */}
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                <IconSparkles size={16} className="text-yellow-300" />
                <span className="text-sm font-medium text-white/90 tracking-wide">{getGreeting()}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                Bienvenido, {user?.nombre || 'Usuario'}
              </h1>
              
              <p className="text-base lg:text-lg text-blue-100 font-light">
                Aquí tienes el resumen de la actividad y estadísticas del sistema en tiempo real.
              </p>

              <div className="flex items-center gap-2 text-blue-200 text-sm pt-2">
                <IconClock size={18} />
                <span className="capitalize font-medium">{getCurrentDate()}</span>
              </div>
            </div>

            {/* Imagen del logo */}
             <div className="hidden lg:flex items-center justify-end shrink-0 flex-1">
              <div className="w-full max-w-md h-full flex items-center justify-end">
                <img 
                  src={ArchivoLogo} 
                  alt="Logo Archivo" 
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Cards */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#032DFF] transition-colors">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgGradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 lg:px-8 pb-8">
        {/* Gráfico Circular: Documentos por Estado */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-blue-50 text-[#032DFF]">
              <IconChartPie size={22} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Estado de Documentos</h3>
          </div>
          
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center">
            {isLoadingStats ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032DFF]"></div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Gráfico de Barras: Documentos por Área */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <IconFileText size={22} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Documentos por Área</h3>
          </div>

          <div className="flex-1 min-h-[300px]">
            {docsByArea && docsByArea.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={docsByArea} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Bar dataKey="value" name="Documentos" fill="#032DFF" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm">Cargando datos de áreas...</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente - Full Width en Mobile, 1/3 en Desktop si hubiera más columnas, pero aquí lo pondré abajo o en otra fila */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
                <IconActivity size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
            </div>
            <button className="text-sm font-medium text-[#032DFF] hover:text-blue-700 transition-colors">
              Ver todo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingActivity ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="rounded-full bg-gray-200 h-10 w-10 mr-4"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : userActivity && userActivity.length > 0 ? (
              userActivity.map((activity: any, index: number) => {
                const initials = activity.usuario.nombres.charAt(0) + (activity.usuario.apellidos?.charAt(0) || '');
                const fullName = `${activity.usuario.nombres} ${activity.usuario.apellidos || ''}`.trim();
                const timeAgo = new Date(activity.ultima_actividad).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <div key={`${activity.id_usuario}-${index}`} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-100 text-[#032DFF] font-bold text-sm shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Realizó <span className="font-medium text-[#032DFF]">{activity.total_acciones} acciones</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <IconClock size={10} />
                        {timeAgo}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No hay actividad reciente registrada
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
