import {
  Permission as PrismaPermission,
  Resource as PrismaResource,
  Action as PrismaAction,
} from '@prisma/client';
import { Permission, PermissionCode } from '../domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export type PrismaPermissionWithRelations = PrismaPermission & {
  resource?: PrismaResource;
  action?: PrismaAction;
};

export class PermissionPersistenceMapper {
  static toDomain(prisma: PrismaPermissionWithRelations): Permission {
    const resourceName = prisma.resource?.name || '';
    const actionName = prisma.action?.name || '';

    let name = '';
    if (actionName && resourceName) {
      name = `${actionName} ${resourceName}`;
    } else {
      const parts = prisma.code.split(':');
      name = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .reverse()
        .join(' ');
    }

    return Permission.rehydrate(Identifier.create(prisma.id), {
      code: PermissionCode.create(prisma.code),
      name: name,
      description: prisma.description ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static toPersistence(permission: Permission) {
    return {
      code: permission.code.value,
      description: permission.description ?? null,
    };
  }
}
