/**
 * Auditoria Page
 * Displays system audit logs with filtering and pagination
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconHistory, IconSearch, IconFilter, IconAlertCircle, IconX } from '@tabler/icons-react';
import { 
  PageContainer, 
  PageHeader, 
  Pagination, 
  DataTable, 
  Input, 
  Card, 
  CardBody, 
  Badge, 
  Button 
} from '@/components/ui';
import { auditService } from '@/services';
import { usePermissions } from '@/hooks';
import { useAuth } from '@/auth';
import type { AuditLog } from '@/services/auditService';
import type { Column } from '@/components/ui/DataTable';

const AuditoriaPage = () => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const itemsPerPage = 20;
  
  const canAccess = user?.rol === 'Administrador' || hasPermission('system_admin');

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
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string): 'success' | 'info' | 'warning' | 'error' => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('crear') || actionLower.includes('insert')) return 'success';
    if (actionLower.includes('actualizar') || actionLower.includes('update')) return 'info';
    if (actionLower.includes('eliminar') || actionLower.includes('delete')) return 'error';
    return 'warning';
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Fecha y Hora',
      accessorKey: 'fecha_hora',
      sortable: true,
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 whitespace-nowrap">
          {formatDate(row.original.fecha_hora)}
        </div>
      )
    },
    {
      header: 'Usuario',
      accessorKey: 'Usuario',
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <div className="text-sm font-medium text-gray-900">
            {row.original.Usuario?.nombre_usuario || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.Usuario?.nombres} {row.original.Usuario?.apellidos}
          </div>
        </div>
      )
    },
    {
      header: 'Acción',
      accessorKey: 'accion',
      sortable: true,
      cell: ({ row }) => (
        <Badge variant={getActionColor(row.original.accion)}>
          {row.original.accion}
        </Badge>
      )
    },
    {
      header: 'Tabla Afectada',
      accessorKey: 'tabla_afectada',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-mono">
          {row.original.tabla_afectada || '-'}
        </span>
      )
    },
    {
      header: 'Detalles',
      accessorKey: 'detalles',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={row.original.detalles || ''}>
          {row.original.detalles || '-'}
        </div>
      )
    },
    {
      header: 'IP',
      accessorKey: 'ip_address',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-mono">
          {row.original.ip_address || '-'}
        </span>
      )
    }
  ];

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

  const hasActiveFilters = searchTerm || fechaInicio || fechaFin;

  return (
    <PageContainer>
      <PageHeader
        title="Auditoría del Sistema"
        description="Registro de actividades y acciones realizadas en el sistema"
        icon={<IconHistory size={28} className="text-white" strokeWidth={2} />}
      />

      <div className="p-6 space-y-6">
        {/* Filters Card */}
        <Card>
          <CardBody>
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
                <Input
                  type="text"
                  placeholder="Buscar por acción o detalles..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  placeholder="Fecha inicio"
                />
              </div>

              <div>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  placeholder="Fecha fin"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFilterReset}
                  startIcon={<IconX size={16} />}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Stats */}
        {data && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Mostrando <strong>{data.logs.length}</strong> de <strong>{data.total}</strong> registros de auditoría
            </p>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          data={data?.logs || []}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No se encontraron registros de auditoría"
        />

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
