/**
 * Rol Permisos Page
 * Página para gestionar los permisos de un rol
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconShieldCheck,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import type { RolConPermisos, PermisosResponse, Permiso } from '@/types';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

const RolPermisosPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Permisos
  const canAdmin = hasPermission('users_admin');

  // Estados
  const [rol, setRol] = useState<RolConPermisos | null>(null);
  const [todosLosPermisos, setTodosLosPermisos] = useState<PermisosResponse | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmExitModal, setShowConfirmExitModal] = useState(false);

  // Verificar permisos y cargar datos
  useEffect(() => {
    if (!canAdmin) {
      toast.error('No tienes permisos para gestionar permisos de roles');
      navigate('/roles');
      return;
    }

    if (!id) {
      toast.error('ID de rol no válido');
      navigate('/roles');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canAdmin]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [rolData, permisosData] = await Promise.all([
        roleService.getRoleById(Number(id)),
        permissionService.getPermissions(),
      ]);

      setRol(rolData as RolConPermisos);
      setTodosLosPermisos(permisosData);

      // Inicializar permisos seleccionados con los permisos actuales del rol
      const permisosActuales = new Set(
        (rolData as RolConPermisos).permisos.map((p) => p.id_permiso)
      );
      setPermisosSeleccionados(permisosActuales);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de permiso individual
  const handlePermisoToggle = (permisoId: number) => {
    setPermisosSeleccionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permisoId)) {
        newSet.delete(permisoId);
      } else {
        newSet.add(permisoId);
      }
      setHasChanges(true);
      return newSet;
    });
  };

  // Seleccionar/Deseleccionar todos los permisos de una categoría
  const handleCategoriaToggle = (_categoria: string, permisos: Permiso[]) => {
    setPermisosSeleccionados((prev) => {
      const newSet = new Set(prev);
      const permisosIds = permisos.map((p) => p.id_permiso);
      const todosMarcados = permisosIds.every((id) => newSet.has(id));

      if (todosMarcados) {
        // Desmarcar todos
        permisosIds.forEach((id) => newSet.delete(id));
      } else {
        // Marcar todos
        permisosIds.forEach((id) => newSet.add(id));
      }
      
      setHasChanges(true);
      return newSet;
    });
  };

  // Verificar si todos los permisos de una categoría están seleccionados
  const isCategoriaCompleta = (permisos: Permiso[]): boolean => {
    return permisos.every((p) => permisosSeleccionados.has(p.id_permiso));
  };

  // Verificar si algún permiso de una categoría está seleccionado
  const isCategoriaIndeterminada = (permisos: Permiso[]): boolean => {
    const algunos = permisos.some((p) => permisosSeleccionados.has(p.id_permiso));
    const todos = permisos.every((p) => permisosSeleccionados.has(p.id_permiso));
    return algunos && !todos;
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      await roleService.assignPermissions(Number(id), {
        permisos: Array.from(permisosSeleccionados),
      });
      toast.success('Permisos actualizados exitosamente');
      setHasChanges(false);
      navigate(`/roles/${id}`);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmExitModal(true);
    } else {
      navigate(`/roles/${id}`);
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmExitModal(false);
    navigate(`/roles/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#3f37c9] mb-4"></div>
          <p className="text-gray-500">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  if (!rol || !todosLosPermisos) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gestionar Permisos"
        description={`Asigna permisos al rol ${rol.nombre_rol}`}
        icon={<IconShieldCheck size={32} className="text-white" strokeWidth={1.5} />}
        backButton={{
          onClick: handleCancel,
          label: "Roles",
        }}
        actionButtons={[{
          id: "guardar",
          label: saving ? "Guardando..." : "Guardar Cambios",
          onClick: handleSave,
          variant: "primary" as const,
          disabled: saving || !hasChanges,
        }]}
      />

      <div className="p-6 lg:p-8 space-y-6">

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IconAlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">
              Información importante
            </p>
            <p className="text-sm text-blue-800">
              Los cambios en los permisos afectarán inmediatamente a todos los usuarios 
              que tengan este rol asignado. Selecciona cuidadosamente los permisos según 
              las responsabilidades del rol.
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de selección */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCheck size={20} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Permisos seleccionados:
            </span>
            <span className="text-lg font-bold text-[#3f37c9]">
              {permisosSeleccionados.size}
            </span>
            <span className="text-sm text-gray-600">
              de {todosLosPermisos.total}
            </span>
          </div>
          {hasChanges && (
            <span className="text-sm text-yellow-600 font-medium">
              • Cambios sin guardar
            </span>
          )}
        </div>
      </div>

      {/* Lista de permisos por categoría */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Permisos Disponibles
        </h2>

        <div className="space-y-6">
          {Object.entries(todosLosPermisos.permisos_por_categoria).map(
            ([categoria, permisos]: [string, Permiso[]]) => {
              const categoriaCompleta = isCategoriaCompleta(permisos);
              const categoriaIndeterminada = isCategoriaIndeterminada(permisos);

              return (
                <div
                  key={categoria}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#3f37c9]/30 transition-colors"
                >
                  {/* Header de categoría */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCategoriaToggle(categoria, permisos)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          categoriaCompleta
                            ? 'bg-[#3f37c9] border-[#3f37c9]'
                            : categoriaIndeterminada
                            ? 'bg-[#3f37c9]/30 border-[#3f37c9]'
                            : 'border-gray-300 hover:border-[#3f37c9]'
                        }`}
                      >
                        {categoriaCompleta && (
                          <IconCheck size={14} className="text-white" />
                        )}
                        {categoriaIndeterminada && (
                          <div className="w-2 h-2 bg-[#3f37c9] rounded-sm" />
                        )}
                      </button>
                      <h3 className="text-base font-semibold text-gray-900 capitalize">
                        {categoria.replace('_', ' ')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({permisos.filter((p) => permisosSeleccionados.has(p.id_permiso)).length}/
                        {permisos.length})
                      </span>
                    </div>
                    <button
                      onClick={() => handleCategoriaToggle(categoria, permisos)}
                      className="text-sm text-[#3f37c9] hover:text-[#3f37c9]/80 font-medium"
                    >
                      {categoriaCompleta ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  {/* Lista de permisos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permisos.map((permiso) => {
                      const isSelected = permisosSeleccionados.has(permiso.id_permiso);

                      return (
                        <label
                          key={permiso.id_permiso}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#3f37c9]/5 border border-[#3f37c9]/30'
                              : 'bg-gray-50 border border-gray-200 hover:border-[#3f37c9]/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePermisoToggle(permiso.id_permiso)}
                            className="mt-1 w-4 h-4 text-[#3f37c9] border-gray-300 rounded focus:ring-[#3f37c9]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {permiso.nombre_permiso}
                            </p>
                            {permiso.descripcion && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                {permiso.descripcion}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Mensaje si no hay permisos */}
        {Object.keys(todosLosPermisos.permisos_por_categoria).length === 0 && (
          <div className="text-center py-12">
            <IconAlertCircle size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No hay permisos disponibles</p>
          </div>
        )}
      </div>

      {/* Botones de acción inferiores */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Total de permisos seleccionados:{' '}
              <span className="font-bold text-[#3f37c9]">
                {permisosSeleccionados.size}
              </span>
            </p>
            {hasChanges && (
              <p className="text-sm text-yellow-600 mt-1">
                Tienes cambios sin guardar
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              isLoading={saving}
              disabled={saving || !hasChanges}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* Modal de confirmación para salir sin guardar */}
      <ConfirmModal
        isOpen={showConfirmExitModal}
        onClose={() => setShowConfirmExitModal(false)}
        onConfirm={handleConfirmExit}
        title="Descartar cambios"
        message="Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardarlos?"
        confirmText="Descartar"
        cancelText="Seguir editando"
        isLoading={false}
      />
    </PageContainer>
  );
};

export default RolPermisosPage;
