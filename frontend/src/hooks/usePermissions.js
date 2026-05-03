import { useMemo } from 'react';

/**
 * Hook to check if the current user has specific permissions.
 * Permissions are stored as 'Module:Action' strings in user object.
 */
export const usePermissions = () => {
  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const hasPermission = (module, action) => {
    if (!user) return false;
    
    // SUPERADMIN has all permissions by default
    if (user.rol_nombre === 'SUPERADMIN') return true;

    if (!user.permissions) return false;
    
    return user.permissions.includes(`${module}:${action}`);
  };

  return { user, hasPermission };
};
