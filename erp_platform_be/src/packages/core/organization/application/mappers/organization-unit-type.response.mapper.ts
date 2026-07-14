import { OrganizationUnitType } from '@core/organization/domain/entities/organization-unit-type';
import { OrganizationUnitTypeDto } from '@core/organization/dto';

export class OrganizationUnitTypeResponseMapper {
  static toResponse(domain: OrganizationUnitType): OrganizationUnitTypeDto {
    return {
      id: domain.id.getValue(),
      code: domain.code,
      name: domain.name,
      description: domain.description ?? undefined,
    };
  }
}
