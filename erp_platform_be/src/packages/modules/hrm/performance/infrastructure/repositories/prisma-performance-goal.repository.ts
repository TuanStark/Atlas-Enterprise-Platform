import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceGoal } from '../../domain/aggregates/performance-goal.aggregate';
import { PerformanceGoalRepository } from '../../domain/repositories/performance-goal.repository';
import { PerformanceGoalPersistenceMapper } from '../mappers/performance-goal.persistence.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaPerformanceGoalRepository implements PerformanceGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    goalPerformanceGoalProgress: true,
  };

  async save(entity: PerformanceGoal): Promise<void> {
    const data = PerformanceGoalPersistenceMapper.toPersistence(entity);

    await this.prisma.performanceGoal.create({
      data: {
        ...data,
        goalPerformanceGoalProgress: {
          create: entity.progresses.map((p) => ({
            id: p.id.toString(),
            progress: p.progress !== undefined ? new Prisma.Decimal(p.progress) : null,
            note: p.note,
            updatedByPrincipalId: p.updatedByPrincipalId ? p.updatedByPrincipalId.toString() : null,
            updatedAt: p.updatedAt,
          })),
        },
      },
    });
  }

  async update(entity: PerformanceGoal): Promise<void> {
    const data = PerformanceGoalPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      await tx.performanceGoal.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          targetValue: data.targetValue,
          weight: data.weight,
          dueDate: data.dueDate,
          updatedAt: data.updatedAt,
        },
      });

      // Sync progresses
      await tx.performanceGoalProgress.deleteMany({ where: { goalId: data.id } });
      if (entity.progresses.length > 0) {
        await tx.performanceGoalProgress.createMany({
          data: entity.progresses.map((p) => ({
            id: p.id.toString(),
            goalId: data.id,
            progress: p.progress !== undefined ? new Prisma.Decimal(p.progress) : null,
            note: p.note ?? null,
            updatedByPrincipalId: p.updatedByPrincipalId ? p.updatedByPrincipalId.toString() : null,
            updatedAt: p.updatedAt,
          })),
        });
      }
    });
  }

  async delete(entity: PerformanceGoal): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.performanceGoalProgress.deleteMany({ where: { goalId: entity.id.toString() } });
      await tx.performanceGoal.delete({ where: { id: entity.id.toString() } });
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<PerformanceGoal | null> {
    const record = await this.prisma.performanceGoal.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
    });
    return record ? PerformanceGoalPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<PerformanceGoal[]> {
    const records = await this.prisma.performanceGoal.findMany({
      where: { tenantId: tenantId.toString(), employmentId: employmentId.toString() },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(PerformanceGoalPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<PerformanceGoal[]> {
    const records = await this.prisma.performanceGoal.findMany({
      where: { tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(PerformanceGoalPersistenceMapper.toDomain);
  }
}
