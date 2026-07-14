import { OrganizationUnitType } from '@core/organization/domain';
import { OrganizationUnitType as PrismaOrganizationUnitType } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class OrganizationUnitTypePersistenceMapper {
  static toDomain(entity: PrismaOrganizationUnitType): OrganizationUnitType {
    return OrganizationUnitType.rehydrate(Identifier.create(entity.id), {
      code: entity.code,
      name: entity.name,
      description: entity.description ?? undefined,
    });
  }

  static toPersistence(domain: OrganizationUnitType) {
    return {
      code: domain.code,
      name: domain.name,
      description: domain.description,
    };
  }
}
