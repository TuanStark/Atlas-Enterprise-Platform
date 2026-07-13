import { Injectable } from '@nestjs/common';
import { PermissionCache } from '../../domain/repositories/permission-cache.port';
import { ResolvedPermission } from '../../domain/repositories/permission-resolver.port';

interface CacheEntry {
  permissions: ResolvedPermission[];
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class MemoryPermissionCache implements PermissionCache {
  private readonly store = new Map<string, CacheEntry>();

  async get(principalId: string): Promise<ResolvedPermission[] | null> {
    const entry = this.store.get(principalId);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(principalId);
      return null;
    }
    return entry.permissions;
  }

  async set(
    principalId: string,
    permissions: ResolvedPermission[],
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    this.store.set(principalId, {
      permissions,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async invalidate(principalId: string): Promise<void> {
    this.store.delete(principalId);
  }

  async invalidateAll(): Promise<void> {
    this.store.clear();
  }
}
