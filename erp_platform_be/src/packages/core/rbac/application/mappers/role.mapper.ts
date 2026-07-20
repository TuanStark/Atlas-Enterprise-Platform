import { Role } from '@core/rbac/domain/entities/role';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleCode } from '@core/rbac/domain/value-objects/role-code';
import { RoleDto } from '../dto/role.dto';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class RoleMapper {
  static toDomain(dto: CreateRoleDto): Role {
    return Role.create({
      tenantId: Identifier.create(dto.tenantId),
      code: RoleCode.create(dto.code),
      name: dto.name,
      description: dto.description,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static toDto(role: Role): RoleDto {
    return {
      id: role.id.getValue(),
      tenantId: role.tenantId.getValue(),
      code: role.code.value,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt?.toISOString(),
      updatedAt: role.updatedAt?.toISOString(),
      rolePermissions: role.permissions.map((p) => ({
        permissionId: p.permissionId.getValue(),
      })),
    };
  }
}
