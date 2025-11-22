import { useAuth } from '@/auth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permissionCode: string) => {
    // Implement logic to check permissions based on user role or permissions list
    // For now, we'll assume admin has all permissions
    if (user?.rol === 'ADMIN') return true;
    return false;
  };

  return {
    hasPermission
  };
};
