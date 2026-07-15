import {
  PerformanceGoal as PrismaPerformanceGoal,
  PerformanceGoalProgress as PrismaGoalProgress,
  Prisma,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceGoal } from '../../domain/aggregates/performance-goal.aggregate';
import { PerformanceGoalProgress } from '../../domain/entities/performance-goal-progress.entity';

export type PrismaPerformanceGoalPayload = PrismaPerformanceGoal & {
  goalPerformanceGoalProgress?: PrismaGoalProgress[];
};

export class PerformanceGoalPersistenceMapper {
  static toDomain(prisma: PrismaPerformanceGoalPayload): PerformanceGoal {
    const goalId = Identifier.create(prisma.id);

    return PerformanceGoal.rehydrate(goalId, {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      performanceCycleId: Identifier.create(prisma.performanceCycleId),
      title: prisma.title ?? undefined,
      description: prisma.description ?? undefined,
      targetValue: prisma.targetValue ? prisma.targetValue.toNumber() : undefined,
      weight: prisma.weight ? prisma.weight.toNumber() : undefined,
      dueDate: prisma.dueDate ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      progresses: (prisma.goalPerformanceGoalProgress ?? []).map((p) =>
        PerformanceGoalProgress.rehydrate(Identifier.create(p.id), {
          goalId,
          progress: p.progress ? p.progress.toNumber() : undefined,
          note: p.note ?? undefined,
          updatedByPrincipalId: p.updatedByPrincipalId
            ? Identifier.create(p.updatedByPrincipalId)
            : undefined,
          updatedAt: p.updatedAt ?? new Date(),
        }),
      ),
    });
  }

  static toPersistence(entity: PerformanceGoal): PrismaPerformanceGoal {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      performanceCycleId: entity.performanceCycleId.toString(),
      title: entity.title ?? null,
      description: entity.description ?? null,
      targetValue: entity.targetValue !== undefined ? new Prisma.Decimal(entity.targetValue) : null,
      weight: entity.weight !== undefined ? new Prisma.Decimal(entity.weight) : null,
      dueDate: entity.dueDate ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
