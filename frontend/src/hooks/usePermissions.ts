import { useAuth } from '@/auth';

export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permissionCode - Código del permiso a verificar
   * @returns true si tiene el permiso, false en caso contrario
   */
  const hasPermission = (_permissionCode: string): boolean => {
    if (!user) return false;

    // Admin tiene todos los permisos
    if (user.rol === 'ADMIN') return true;

    // Aquí puedes agregar lógica adicional para verificar permisos
    // basado en la estructura de tu backend
    return false;
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

    // Verificar si tiene al menos uno de los permisos
    return permissionCodes.some(permission => hasPermission(permission));
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
    return permissionCodes.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.rol === 'ADMIN',
  };
};
