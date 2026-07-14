import { Organization } from '@core/organization/domain/entities/organization';
import { OrganizationDto } from '@core/organization/dto';

export class OrganizationResponseMapper {
  static toResponse(domain: Organization): OrganizationDto {
    return {
      id: domain.id.getValue(),
      tenantId: domain.tenantId.getValue(),
      code: domain.code.value,
      name: domain.name,
      description: domain.description ?? undefined,
      isActive: domain.isActive,
      createdAt: domain.createdAt ?? new Date(),
      updatedAt: domain.updatedAt ?? undefined,
    };
  }
}
