import { useState, useEffect } from 'react';
import { IconSettings, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { configService, type Config } from '@/services/configService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { Card, CardBody } from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Input from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/auth';

const ConfiguracionPage = () => {
  const { toast } = useToast();
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  
  // El módulo de configuración requiere rol Administrador
  const canManageConfig = user?.rol === 'Administrador' || isAdmin;

  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<Config | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await configService.getAll();
      setConfigs(data);
    } catch (error: any) {
      console.error('Error loading configs:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar la configuración';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: Config) => {
    setEditingConfig(config);
    setFormData({
      key: config.key,
      value: config.value,
      description: config.description || ''
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    setFormData({
      key: '',
      value: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (config: Config) => {
    setDeleteConfig(config);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig) return;
    
    try {
      await configService.delete(deleteConfig.key);
      toast.success('Configuración eliminada exitosamente');
      loadConfigs();
      setDeleteConfig(null);
    } catch (error: any) {
      console.error('Error deleting config:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar la configuración';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones en el frontend
    if (!formData.key.trim()) {
      toast.error('La clave es requerida');
      return;
    }

    if (!formData.value.trim()) {
      toast.error('El valor es requerido');
      return;
    }

    // Validar formato de la clave
    const keyRegex = /^[A-Z0-9_]+$/;
    if (!keyRegex.test(formData.key)) {
      toast.error('La clave debe contener solo mayúsculas, números y guiones bajos');
      return;
    }

    try {
      if (editingConfig) {
        // Actualizar configuración existente con PUT
        await configService.update(formData.key, formData.value, formData.description);
        toast.success('Configuración actualizada exitosamente');
      } else {
        // Crear nueva configuración con POST
        await configService.set(formData.key, formData.value, formData.description);
        toast.success('Configuración creada exitosamente');
      }
      setIsModalOpen(false);
      loadConfigs();
    } catch (error: any) {
      console.error('Error saving config:', error);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          'Error al guardar la configuración';
      toast.error(errorMessage);
    }
  };

  // Define DataTable columns
  const columns: Column<Config>[] = [
    {
      header: 'Clave',
      accessorKey: 'key',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 font-mono">{row.original.key}</span>
      )
    },
    {
      header: 'Valor',
      accessorKey: 'value',
      cell: ({ row }) => (
        <span className="text-gray-600 max-w-xs truncate block" title={row.original.value}>
          {row.original.value}
        </span>
      )
    },
    {
      header: 'Descripción',
      accessorKey: 'description',
      cell: ({ row }) => (
        <span className="text-gray-500">{row.original.description || '-'}</span>
      )
    },
    ...(canManageConfig ? [{
      header: 'Acciones',
      id: 'actions',
      align: 'right' as const,
      cell: ({ row }: { row: { original: Config } }) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <IconEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <IconTrash size={18} />
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Configuración del Sistema"
        description="Gestiona las variables y parámetros globales del sistema"
        icon={<IconSettings size={28} className="text-white" strokeWidth={2}  />}
        actionButton={
          canManageConfig ? (
            <Button 
              onClick={handleAddNew} 
              startIcon={<IconPlus size={20} className="text-[#0A36CC]" />}
              className="bg-white text-[#0A36CC] hover:bg-gray-50 border border-gray-200"
            >
              Nueva Variable
            </Button>
          ) : undefined
        }
      />
<div className="p-6 space-y-6">
      <DataTable
        columns={columns}
        data={configs}
        isLoading={loading}
        emptyMessage="No hay configuraciones registradas"
      />

      {/* Modal de Edición/Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clave (Key)
                  </label>
                  <Input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                    disabled={!!editingConfig}
                    placeholder="EJEMPLO_CLAVE"
                    pattern="[A-Z0-9_]+"
                    title="Solo mayúsculas, números y guiones bajos"
                    required
                  />
                  {editingConfig ? (
                    <p className="text-xs text-gray-500 mt-1">
                      La clave no se puede modificar una vez creada.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Solo mayúsculas, números y guiones bajos (A-Z, 0-9, _)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <textarea
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Valor de la configuración"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Para qué sirve esta variable"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Guardar
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={!!deleteConfig}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Configuración"
        message={
          <div>
            <p>¿Estás seguro de que deseas eliminar la configuración?</p>
            <p className="mt-2 font-mono text-sm bg-gray-100 p-2 rounded">
              {deleteConfig?.key}
            </p>
          </div>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
      </div>
    </PageContainer>
  );
};

export default ConfiguracionPage;
