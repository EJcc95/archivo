/**
 * Auditoria Page
 * Displays system audit logs with filtering and pagination
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconHistory, IconSearch, IconFilter,IconAlertCircle } from '@tabler/icons-react';
import { PageContainer, PageHeader, Pagination } from '@/components/ui';
import { auditService } from '@/services';
import { usePermissions } from '@/hooks';
import type { AuditLog } from '@/services/auditService';

const AuditoriaPage = () => {
  const { hasPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const  [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const itemsPerPage = 20;
  
  const canAccess = hasPermission('system_admin');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', currentPage, searchTerm, fechaInicio, fechaFin],
    queryFn: () => auditService.getAuditLogs({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
    }),
    enabled: canAccess,
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setSearchTerm('');
    setFechaInicio('');
    setFechaFin('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (!canAccess) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <IconAlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Acceso Denegado</h2>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a la auditoría</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Auditoría del Sistema"
        description="Registro de actividades y acciones realizadas en el sistema"
        icon={<IconHistory size={28} className="text-white" strokeWidth={2} />}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <IconFilter size={20} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por acción o detalles..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Fecha inicio"
              />
            </div>

            <div>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Fecha fin"
              />
            </div>
          </div>

          {(searchTerm || fechaInicio || fechaFin) && (
            <div className="mt-4">
              <button
                onClick={handleFilterReset}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {data && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Mostrando <strong>{data.logs.length}</strong> de <strong>{data.total}</strong> registros de auditoría
            </p>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !data || data.logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron registros de auditoría
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tabla Afectada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.logs.map((log: AuditLog) => (
                  <tr key={log.id_auditoria} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.fecha_hora)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.Usuario?.nombre_usuario || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.Usuario?.nombres} {log.Usuario?.apellidos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.tabla_afectada || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.detalles || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={data.total}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default AuditoriaPage;
