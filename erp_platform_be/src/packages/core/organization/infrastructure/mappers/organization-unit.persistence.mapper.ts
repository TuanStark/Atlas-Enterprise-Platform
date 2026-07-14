import { OrganizationUnit } from '@core/organization/domain';
import { OrganizationUnit as PrismaOrganizationUnit, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class OrganizationUnitPersistenceMapper {
  static toDomain(entity: PrismaOrganizationUnit): OrganizationUnit {
    return OrganizationUnit.rehydrate(Identifier.create(entity.id), {
      organizationId: Identifier.create(entity.organizationId),
      parentUnitId: entity.parentUnitId ? Identifier.create(entity.parentUnitId) : undefined,
      unitTypeId: Identifier.create(entity.unitTypeId),
      code: entity.code,
      name: entity.name,
      path: entity.path ?? undefined,
      level: entity.level ?? 0,
      sortOrder: entity.sortOrder ?? 0,
      metadata: (entity.metadata as Record<string, unknown>) ?? undefined,
      isActive: entity.isActive ?? true,
      version: entity.version ?? 1,
    });
  }

  static toPersistence(domain: OrganizationUnit) {
    return {
      organizationId: domain.organizationId.getValue(),
      parentUnitId: domain.parentUnitId ? domain.parentUnitId.getValue() : null,
      unitTypeId: domain.unitTypeId.getValue(),
      code: domain.code,
      name: domain.name,
      path: domain.path ?? null,
      level: domain.level,
      sortOrder: domain.sortOrder,
      metadata: (domain.metadata as Prisma.JsonObject) ?? Prisma.JsonNull,
      isActive: domain.isActive,
      version: domain.version,
    };
  }
}
