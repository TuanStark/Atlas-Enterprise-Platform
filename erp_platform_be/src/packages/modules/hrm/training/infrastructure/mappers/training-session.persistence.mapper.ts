import { TrainingSession as PrismaTrainingSession, TrainingStatus } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingSession } from '../../domain/aggregates/training-session.aggregate';

export class TrainingSessionPersistenceMapper {
  static toDomain(prisma: PrismaTrainingSession): TrainingSession {
    return TrainingSession.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      courseId: Identifier.create(prisma.courseId),
      instructorEmploymentId: prisma.instructorEmploymentId
        ? Identifier.create(prisma.instructorEmploymentId)
        : undefined,
      startDate: prisma.startDate ?? undefined,
      endDate: prisma.endDate ?? undefined,
      location: prisma.location ?? undefined,
      capacity: prisma.capacity ?? undefined,
      status: prisma.status ?? TrainingStatus.planned,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: TrainingSession): PrismaTrainingSession {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      courseId: entity.courseId.toString(),
      instructorEmploymentId: entity.instructorEmploymentId
        ? entity.instructorEmploymentId.toString()
        : null,
      startDate: entity.startDate ?? null,
      endDate: entity.endDate ?? null,
      location: entity.location ?? null,
      capacity: entity.capacity ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
