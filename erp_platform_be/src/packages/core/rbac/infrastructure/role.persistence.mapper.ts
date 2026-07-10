import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Role, RoleCode } from '../domain';
import { Role as PrismaRole, RolePermission as PrismaRolePermission } from '@prisma/client';
import { RolePermissionPersistenceMapper } from './role-permission.persistence.mapper';

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
      isSystem: role.isSystem,
      updatedAt: new Date(),
    };
  }

  static toDomain(role: PrismaRoleWithRelations): Role {
    const permissions = (role.rolePermissions || []).map((p) =>
      RolePermissionPersistenceMapper.toDomain(p),
    );

    return Role.rehydrate(Identifier.create(role.id), {
      tenantId: Identifier.create(role.tenantId),
      code: RoleCode.create(role.code ?? ''),
      name: role.name ?? '',
      description: role.description ?? undefined,
      isSystem: role.isSystem ?? false,
      permissions,
      createdAt: role.createdAt ?? new Date(),
      updatedAt: role.updatedAt ?? new Date(),
    });
  }
}
