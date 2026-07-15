import { WorkLocation as PrismaWorkLocation } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { WorkLocation } from '../../domain/entities/work-location.entity';

export class WorkLocationPersistenceMapper {
  static toDomain(prisma: PrismaWorkLocation): WorkLocation {
    return WorkLocation.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      address: prisma.address ?? undefined,
      timezone: prisma.timezone ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: WorkLocation): PrismaWorkLocation {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      address: entity.address ?? null,
      timezone: entity.timezone ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
