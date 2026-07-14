import { OrganizationUnit } from '@core/organization/domain/entities/organization-unit';
import { OrganizationUnitDto } from '@core/organization/dto';

export class OrganizationUnitResponseMapper {
  static toResponse(domain: OrganizationUnit): OrganizationUnitDto {
    return {
      id: domain.id.getValue(),
      organizationId: domain.organizationId.getValue(),
      parentUnitId: domain.parentUnitId?.getValue() ?? undefined,
      unitTypeId: domain.unitTypeId.getValue(),
      code: domain.code,
      name: domain.name,
      path: domain.path ?? undefined,
      level: domain.level,
      sortOrder: domain.sortOrder,
      metadata: domain.metadata ?? undefined,
      isActive: domain.isActive,
      version: domain.version,
    };
  }
}
