/**
 * Dashboard Page
 * Página principal del dashboard con estadísticas reales del backend
 */

import { useAuth } from '@/auth';
import { IconFileText, IconUsers, IconFolders, IconArchive, IconSparkles, IconClock } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui';
import { reportService } from '@/services';
import ArchivoLogo from '@/assets/archivo-logo.png';

const DashboardPage = () => {
  const { user } = useAuth();

  // Obtener estadísticas del dashboard
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  // Calcular tendencias basadas en documentos recientes
  const calculateTrend = (recent: number, total: number) => {
    if (!total) return undefined;
    const percentage = ((recent / total) * 100);
    return {
      value: Number(percentage.toFixed(1)),
      isPositive: percentage > 0,
    };
  };

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
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.totalDocuments?.toLocaleString() ?? '0'),
      icon: <IconFileText size={24} className="text-[#3f37c9]" strokeWidth={2} />,
      trend: (dashboardStats?.recentDocuments !== undefined && dashboardStats?.totalDocuments !== undefined)
        ? calculateTrend(dashboardStats.recentDocuments, dashboardStats.totalDocuments)
        : undefined,
      iconBg: 'bg-[#ecf3ff]',
    },
    {
      title: 'Usuarios Activos',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.activeUsers?.toString() ?? '0'),
      icon: <IconUsers size={24} className="text-green-600" strokeWidth={2} />,
      iconBg: 'bg-green-50',
    },
    {
      title: 'Áreas',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.totalAreas?.toString() ?? '0'),
      icon: <IconFolders size={24} className="text-orange-600" strokeWidth={2} />,
      iconBg: 'bg-orange-50',
    },
    {
      title: 'Archivadores',
      value: isLoadingStats || !dashboardStats ? '...' : (dashboardStats.totalArchivadores?.toString() ?? '0'),
      icon: <IconArchive size={24} className="text-purple-600" strokeWidth={2} />,
      iconBg: 'bg-purple-50',
    },
  ];

  // Obtener actividad reciente de auditoría
  const { data: userActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => reportService.getUserActivity({ limit: 4 }),
  });

  return (
    <PageContainer>
      {/* Header Minimalista Mejorado */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#032dff] to-[#032dff] rounded-2xl mx-6 lg:mx-8 mt-6 lg:mt-8">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNnptMCAyNGMzLjMxIDAgNi0yLjY5IDYtNnMtMi42OS02LTYtNi02IDIuNjktNiA2IDIuNjkgNiA2IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative px-6 lg:px-10 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Sección de bienvenida */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <IconSparkles size={22} className="text-yellow-400 font-light" />
                <span className="text-xs font-light text-white">{getGreeting()}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Bienvenido de nuevo, {user?.nombre || 'Usuario'}
              </h1>
              
              <p className="text-base lg:text-lg text-white/90 font-light">
                Aquí tienes la vista general de tu panel de control
              </p>

              <div className="flex items-center gap-2 text-white/90 text-sm">
                <IconClock size={16} />
                <span className="capitalize">{getCurrentDate()}</span>
              </div>
            </div>

            {/* Imagen del logo - Ocupa todo el espacio disponible */}
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

      {/* Estadísticas */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>{stat.icon}</div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                  {stat.trend && (
                    <div className={`mt-1 text-xs font-semibold ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend.isPositive ? '+' : ''}{stat.trend.value}% reciente
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido con estructura de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 lg:p-8">
        {/* Documentos por Estado */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-blue-50">
              <IconFileText size={24} className="text-[#032dff]" />
            </div>
            <div className="text-lg font-bold text-gray-900">Documentos por Estado</div>
          </div>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032dff]"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardStats?.documentsByState && dashboardStats.documentsByState.length > 0 ? (
                dashboardStats.documentsByState.map((item: any, index: number) => {
                  const colors = ['bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-blue-500'];
                  const color = colors[index % colors.length];
                  return (
                    <div key={`${item.estado}-${index}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-blue-50/30 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium text-gray-900">{item.estado}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#032dff]">{item.count}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay documentos registrados</p>
              )}
            </div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-green-50">
              <IconUsers size={24} className="text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">Actividad Reciente</div>
          </div>
          {userActivity && userActivity.length > 0 ? (
            <div className="space-y-4">
              {userActivity.map((activity: any, index: number) => {
                const initials = activity.usuario.nombres.charAt(0) + (activity.usuario.apellidos?.charAt(0) || '');
                const fullName = `${activity.usuario.nombres} ${activity.usuario.apellidos || ''}`.trim();
                const timeAgo = new Date(activity.ultima_actividad).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div key={`${activity.id_usuario}-${index}`} className="flex gap-3 items-center bg-gray-50 rounded-lg p-3 border border-gray-100 hover:bg-green-50/30 transition">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ecf3ff] text-[#032dff] font-bold text-base shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{fullName}</span>{' '}
                        <span className="text-gray-600">realizó {activity.total_acciones} acciones</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Última actividad: {timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
