import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrincipalRole } from '../domain';
import { PrincipalRole as PrismaPrincipalRole } from '@prisma/client';

export class PrincipalRolePersistenceMapper {
  static toDomain(entity: PrismaPrincipalRole): PrincipalRole {
    return PrincipalRole.rehydrate({
      principalId: Identifier.create(entity.principalId),
      roleId: Identifier.create(entity.roleId),
      scopeId: Identifier.create(entity.scopeId),
      assignedAt: entity.assignedAt ?? new Date(),
    });
  }

  static toPersistence(principalRole: PrincipalRole) {
    return {
      principalId: principalRole.principalId.getValue(),
      roleId: principalRole.roleId.getValue(),
      scopeId: principalRole.scopeId.getValue(),
      assignedAt: principalRole.assignedAt,
    };
  }
}
