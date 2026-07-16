import { useAuthStore } from '@features/auth/store/authStore';
import { type ReactNode } from 'react';

/**
 * usePermission — Hook to check PBAC permissions
 *
 * Maps to backend's Policy Evaluation Engine.
 *
 * Usage:
 *   const canCreate = useCanAccess('hrm.employee', 'create');
 *   const canApprove = useCanAccess('hrm.leave_request', 'approve');
 */
export function useCanAccess(resource: string, action: string): boolean {
  return useAuthStore((state) => state.hasPermission(resource, action));
}

/**
 * useHasAnyRole — Check if user has any of the specified roles
 */
export function useHasAnyRole(roles: string[]): boolean {
  const userRoles = useAuthStore((state) => state.user?.roles ?? []);
  return roles.some((role) => userRoles.includes(role) || userRoles.includes('SUPER_ADMIN'));
}

/**
 * PermissionGate — Component that conditionally renders children based on PBAC
 *
 * Usage:
 *   <PermissionGate resource="hrm.employee" action="create">
 *     <Button>Thêm nhân viên</Button>
 *   </PermissionGate>
 */
interface PermissionGateProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ resource, action, children, fallback = null }: PermissionGateProps) {
  const hasPermission = useCanAccess(resource, action);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
