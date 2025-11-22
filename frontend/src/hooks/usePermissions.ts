import { useAuth } from '@/auth';

export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permissionCode - Código del permiso a verificar
   * @returns true si tiene el permiso, false en caso contrario
   */
  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;

    // Admin tiene todos los permisos
    if (user.rol === 'ADMIN') return true;

    // Check if user has the specific permission
    return user.permisos?.includes(permissionCode) ?? false;
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param permissionCodes - Array de códigos de permisos
   * @returns true si tiene al menos uno de los permisos, false en caso contrario
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!user || !Array.isArray(permissionCodes)) return false;

    // Admin tiene todos los permisos
    if (user.rol === 'ADMIN') return true;

    // Check if user has any of the specified permissions
    return permissionCodes.some(code => user.permisos?.includes(code) ?? false);
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param permissionCodes - Array de códigos de permisos
   * @returns true si tiene todos los permisos, false en caso contrario
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!user || !Array.isArray(permissionCodes)) return false;

    // Admin tiene todos los permisos
    if (user.rol === 'ADMIN') return true;

    // Verificar si tiene todos los permisos
    return permissionCodes.every(code => user.permisos?.includes(code) ?? false);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.rol === 'ADMIN',
  };
};

export default usePermissions;
