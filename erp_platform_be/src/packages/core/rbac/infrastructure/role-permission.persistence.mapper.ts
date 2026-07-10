import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RolePermission } from '../domain';
import { RolePermission as PrismaRolePermission, EffectType } from '@prisma/client';

export class RolePermissionPersistenceMapper {
  static toDomain(entity: PrismaRolePermission): RolePermission {
    return RolePermission.create(
      Identifier.create(entity.permissionId),
      entity.effect ?? EffectType.allow,
    );
  }

  static toPersistence(roleId: Identifier, entity: RolePermission) {
    return {
      roleId: roleId.getValue(),
      permissionId: entity.permissionId.getValue(),
      effect: entity.effect,
    };
  }
}

