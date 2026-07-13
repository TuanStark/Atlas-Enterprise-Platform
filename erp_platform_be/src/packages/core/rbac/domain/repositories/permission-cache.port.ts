import { ResolvedPermission } from './permission-resolver.port';

export const PERMISSION_CACHE = Symbol('PERMISSION_CACHE');

export interface PermissionCache {
  get(principalId: string): Promise<ResolvedPermission[] | null>;
  set(principalId: string, permissions: ResolvedPermission[], ttlSeconds?: number): Promise<void>;
  invalidate(principalId: string): Promise<void>;
  invalidateAll(): Promise<void>;
}
