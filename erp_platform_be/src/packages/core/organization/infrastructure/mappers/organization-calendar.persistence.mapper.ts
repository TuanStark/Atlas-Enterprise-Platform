import { OrganizationCalendar } from '@core/organization/domain';
import { OrganizationCalendar as PrismaOrganizationCalendar, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class OrganizationCalendarPersistenceMapper {
  static toDomain(entity: PrismaOrganizationCalendar): OrganizationCalendar {
    return OrganizationCalendar.rehydrate(Identifier.create(entity.id), {
      organizationId: Identifier.create(entity.organizationId),
      name: entity.name ?? undefined,
      timezone: entity.timezone ?? undefined,
      workDays: (entity.workDays as Record<string, unknown>) ?? undefined,
      createdAt: entity.createdAt ?? undefined,
    });
  }

  static toPersistence(domain: OrganizationCalendar) {
    return {
      organizationId: domain.organizationId.getValue(),
      name: domain.name ?? null,
      timezone: domain.timezone ?? null,
      workDays: (domain.workDays as Prisma.JsonObject) ?? Prisma.JsonNull,
    };
  }
}
