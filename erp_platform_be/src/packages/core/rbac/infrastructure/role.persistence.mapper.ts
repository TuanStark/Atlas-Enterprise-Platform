import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Role, RoleCode, RolePermission } from '../domain';
import { Role as PrismaRole, RolePermission as PrismaRolePermission } from '@prisma/client';

type PrismaRoleWithRelations = PrismaRole & {
  rolePermissions: PrismaRolePermission[];
};

export class RolePersistenceMapper {
  static toPersistence(role: Role) {
    return {
      tenantId: role.tenantId.getValue(),
      code: role.code.value,
      name: role.name,
      description: role.description ?? null,
      updatedAt: new Date(),
    };
  }

  static toDomain(raw: PrismaRoleWithRelations): Role {
    const permissions = (raw.rolePermissions || []).map((rp) =>
      RolePermission.rehydrate(Identifier.create(rp.roleId + '_' + rp.permissionId), {
        permissionId: Identifier.create(rp.permissionId),
        createdAt: new Date(),
      }),
    );

    return Role.rehydrate(Identifier.create(raw.id), {
      tenantId: Identifier.create(raw.tenantId),
      code: RoleCode.create(raw.code || ''),
      name: raw.name || '',
      description: raw.description ?? undefined,
      permissions,
      createdAt: raw.createdAt || new Date(),
      updatedAt: raw.updatedAt || new Date(),
    });
  }
}
