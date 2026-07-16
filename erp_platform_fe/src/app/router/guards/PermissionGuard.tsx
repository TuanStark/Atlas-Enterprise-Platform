import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/authStore';

/**
 * PermissionGuard — Checks PBAC permissions before rendering children
 *
 * Maps to backend's Policy Evaluation Engine.
 * If user lacks permission, redirects to 403 page.
 *
 * Usage:
 *   <PermissionGuard resource="hrm.employee" action="read">
 *     <EmployeeListPage />
 *   </PermissionGuard>
 */
interface PermissionGuardProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  resource,
  action,
  children,
  fallback,
}: PermissionGuardProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission(resource, action));

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
