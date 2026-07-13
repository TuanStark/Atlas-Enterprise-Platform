import { Injectable } from '@nestjs/common';
import { EffectType } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PermissionResolver, ResolvedPermission } from '../domain/repositories/permission-resolver.port';

@Injectable()
export class PrismaPermissionResolver implements PermissionResolver {
  constructor(private readonly prisma: PrismaService) { }

  async resolvePermissions(principalId: Identifier): Promise<ResolvedPermission[]> {
    const pid = principalId.getValue();

    // 1. Resolve permissions via roles: principal_roles → roles → role_permissions → permissions
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          principalRoles: {
            some: {
              principalId: pid,
            },
          },
        },
      },
      include: {
        permission: {
          select: {
            code: true,
          },
        },
      },
    });

    // 2. Resolve direct principal permissions
    const directPermissions = await this.prisma.principalPermission.findMany({
      where: {
        principalId: pid,
      },
      include: {
        permission: {
          select: {
            code: true,
          },
        },
      },
    });

    // 3. Aggregate: direct permissions override role permissions
    const permissionMap = new Map<string, EffectType>();

    for (const rp of rolePermissions) {
      const code = rp.permission.code;
      const effect = rp.effect ?? EffectType.allow;
      permissionMap.set(code, effect);
    }

    for (const dp of directPermissions) {
      const code = dp.permission.code;
      const effect = dp.effect ?? EffectType.allow;
      permissionMap.set(code, effect);
    }

    const resolved: ResolvedPermission[] = [];
    for (const [code, effect] of permissionMap) {
      resolved.push({ code, effect });
    }

    return resolved;
  }
}
