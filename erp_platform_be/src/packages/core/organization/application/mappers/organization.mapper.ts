import { Organization } from '@core/organization/domain/entities/organization';
import { OrganizationCode } from '@core/organization/domain/value-objects/organization-code';
import { CreateOrganizationDto } from '@core/organization/dto';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class OrganizationMapper {
  static toDomain(dto: CreateOrganizationDto): Organization {
    return Organization.create({
      tenantId: Identifier.create(dto.tenantId),
      code: OrganizationCode.create(dto.code),
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive ?? true,
    });
  }
}
