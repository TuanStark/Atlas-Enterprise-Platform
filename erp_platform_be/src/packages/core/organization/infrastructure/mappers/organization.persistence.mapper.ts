import { Organization, OrganizationCode } from '@core/organization/domain';
import { Organization as PrismaOrganization } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class OrganizationPersistenceMapper {
  static toDomain(entity: PrismaOrganization): Organization {
    return Organization.rehydrate(
      Identifier.create(entity.id),

      {
        tenantId: Identifier.create(entity.tenantId),
        code: OrganizationCode.create(entity.code),
        name: entity.name,
        description: entity.description ?? undefined,
        isActive: entity.isActive ?? true,
      },
    );
  }

  static toPersistence(organization: Organization) {
    return {
      tenantId: organization.tenantId.getValue(),
      code: organization.code.value,
      name: organization.name,
      description: organization.description,
      isActive: organization.isActive,
    };
  }
}
