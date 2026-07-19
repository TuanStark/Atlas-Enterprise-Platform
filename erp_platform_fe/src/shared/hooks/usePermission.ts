import { type ReactNode } from 'react';
import { useAuthStore } from '@features/auth/store/authStore';
import { parsePermissionCode } from '@shared/constants/permissions';

export function useCanAccess(resource: string, action: string): boolean {
  return useAuthStore((state) => state.hasPermission(resource, action));
}

export function useCanAccessCode(permissionCode: string): boolean {
  const { resource, action } = parsePermissionCode(permissionCode);
  return useCanAccess(resource, action);
}

export function useHasAnyRole(roles: string[]): boolean {
  const userRoles = useAuthStore((state) => state.user?.roles ?? []);
  return roles.some((role) => userRoles.includes(role) || userRoles.includes('SUPER_ADMIN'));
}

interface PermissionGateProps {
  permission?: string;
  resource?: string;
  action?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  let effectiveResource = resource || '';
  let effectiveAction = action || '';

  if (permission) {
    const parsed = parsePermissionCode(permission);
    effectiveResource = parsed.resource;
    effectiveAction = parsed.action;
  }

  const hasPermission = useCanAccess(effectiveResource, effectiveAction);
  return (hasPermission ? children : fallback) as any;
}
