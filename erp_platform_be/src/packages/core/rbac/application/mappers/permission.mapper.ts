import { Permission } from '../../domain/entities/permission';
import { PermissionCode } from '../../domain/value-objects/permission-code';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PermissionDto } from '../dto/permission.dto';

export class PermissionMapper {
  static toDomain(dto: CreatePermissionDto): Permission {
    return Permission.create({
      code: PermissionCode.create(dto.code),
      name: dto.name,
      description: dto.description,
    });
  }

  static toDto(permission: Permission): PermissionDto {
    return {
      id: permission.id.getValue(),
      code: permission.code.value,
      name: permission.name,
      description: permission.description,
    };
  }
}
