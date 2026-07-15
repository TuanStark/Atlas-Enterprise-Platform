import { PerformanceCycle as PrismaPerformanceCycle } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceCycle } from '../../domain/aggregates/performance-cycle.aggregate';

export class PerformanceCyclePersistenceMapper {
  static toDomain(prisma: PrismaPerformanceCycle): PerformanceCycle {
    return PerformanceCycle.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      startDate: prisma.startDate ?? undefined,
      endDate: prisma.endDate ?? undefined,
      isActive: prisma.isActive ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: PerformanceCycle): PrismaPerformanceCycle {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      startDate: entity.startDate ?? null,
      endDate: entity.endDate ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
