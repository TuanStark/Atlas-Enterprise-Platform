import { PerformanceRating as PrismaPerformanceRating, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceRating } from '../../domain/aggregates/performance-rating.aggregate';

export class PerformanceRatingPersistenceMapper {
  static toDomain(prisma: PrismaPerformanceRating): PerformanceRating {
    return PerformanceRating.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code ?? undefined,
      name: prisma.name ?? undefined,
      score: prisma.score ? prisma.score.toNumber() : undefined,
      description: prisma.description ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
    });
  }

  static toPersistence(entity: PerformanceRating): PrismaPerformanceRating {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code ?? null,
      name: entity.name ?? null,
      score: entity.score !== undefined ? new Prisma.Decimal(entity.score) : null,
      description: entity.description ?? null,
      createdAt: entity.createdAt,
    };
  }
}
