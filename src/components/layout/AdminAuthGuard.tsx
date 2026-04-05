import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import type { Permission } from '../../utils/permissions';

interface AdminAuthGuardProps {
  permission?: Permission;
}

export function AdminAuthGuard({ permission }: AdminAuthGuardProps) {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/403" replace />;

  return <Outlet />;
}
