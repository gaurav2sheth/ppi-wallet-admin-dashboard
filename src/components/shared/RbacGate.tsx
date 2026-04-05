import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';
import type { Permission } from '../../utils/permissions';

interface RbacGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RbacGate({ permission, children, fallback = null }: RbacGateProps) {
  const { hasPermission } = useAuthStore();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
