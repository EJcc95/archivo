import { useState, useEffect } from 'react';
import { IconSettings, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { configService, type Config } from '@/services/configService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const ConfiguracionPage = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canManageConfig = hasPermission('admin_config'); // Assuming this permission exists or using admin role check

  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  
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
    } catch (error) {
      console.error('Error loading configs:', error);
      toast.error('Error al cargar la configuración');
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

  const handleDelete = async (key: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta configuración?')) return;
    
    try {
      await configService.delete(key);
      toast.success('Configuración eliminada');
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await configService.set(formData.key, formData.value, formData.description);
      toast.success(editingConfig ? 'Configuración actualizada' : 'Configuración creada');
      setIsModalOpen(false);
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Configuración del Sistema"
        description="Gestiona las variables y parámetros globales del sistema"
        icon={<IconSettings size={24} />}
        actionButton={
          canManageConfig ? (
            <Button onClick={handleAddNew} startIcon={<IconPlus size={20} />}>
              Nueva Variable
            </Button>
          ) : undefined
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Clave</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Valor</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Descripción</th>
                {canManageConfig && <th className="px-6 py-4 font-semibold text-gray-700 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={canManageConfig ? 4 : 3} className="px-6 py-8 text-center text-gray-500">
                    Cargando configuración...
                  </td>
                </tr>
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={canManageConfig ? 4 : 3} className="px-6 py-8 text-center text-gray-500">
                    No hay configuraciones registradas
                  </td>
                </tr>
              ) : (
                configs.map((config, index) => (
                  <tr key={config.key || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 font-mono">
                      {config.key}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={config.value}>
                      {config.value}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {config.description || '-'}
                    </td>
                    {canManageConfig && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(config.key)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición/Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
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
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clave (Key)
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  disabled={!!editingConfig} // No editar key si ya existe
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="EJEMPLO_CLAVE"
                  required
                />
                {editingConfig && <p className="text-xs text-gray-500 mt-1">La clave no se puede modificar una vez creada.</p>}
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
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Para qué sirve esta variable"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ConfiguracionPage;
