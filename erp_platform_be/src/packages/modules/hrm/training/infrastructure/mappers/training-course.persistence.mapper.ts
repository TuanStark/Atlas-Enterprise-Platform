import { TrainingCourse as PrismaTrainingCourse, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingCourse } from '../../domain/aggregates/training-course.aggregate';

export class TrainingCoursePersistenceMapper {
  static toDomain(prisma: PrismaTrainingCourse): TrainingCourse {
    return TrainingCourse.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      category: prisma.category ?? undefined,
      durationHours: prisma.durationHours ? prisma.durationHours.toNumber() : undefined,
      description: prisma.description ?? undefined,
      isActive: prisma.isActive ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: TrainingCourse): PrismaTrainingCourse {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      category: entity.category ?? null,
      durationHours:
        entity.durationHours !== undefined ? new Prisma.Decimal(entity.durationHours) : null,
      description: entity.description ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
