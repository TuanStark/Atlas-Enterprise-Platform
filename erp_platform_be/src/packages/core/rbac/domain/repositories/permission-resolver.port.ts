import { EffectType } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface ResolvedPermission {
  code: string;
  effect: EffectType;
}

export const PERMISSION_RESOLVER = Symbol('PERMISSION_RESOLVER');

export interface PermissionResolver {
  resolvePermissions(principalId: Identifier): Promise<ResolvedPermission[]>;
}
