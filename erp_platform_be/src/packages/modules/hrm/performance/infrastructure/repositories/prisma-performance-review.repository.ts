import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceReview } from '../../domain/aggregates/performance-review.aggregate';
import { PerformanceReviewRepository } from '../../domain/repositories/performance-review.repository';
import { PerformanceReviewPersistenceMapper } from '../mappers/performance-review.persistence.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaPerformanceReviewRepository implements PerformanceReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    performanceReviewPerformanceReviewItems: true,
  };

  async save(entity: PerformanceReview): Promise<void> {
    const data = PerformanceReviewPersistenceMapper.toPersistence(entity);

    await this.prisma.performanceReview.create({
      data: {
        ...data,
        performanceReviewPerformanceReviewItems: {
          create: entity.reviewItems.map((ri) => ({
            id: ri.id.toString(),
            goalId: ri.goalId ? ri.goalId.toString() : null,
            criteria: ri.criteria,
            ratingId: ri.ratingId ? ri.ratingId.toString() : null,
            score: ri.score !== undefined ? new Prisma.Decimal(ri.score) : null,
            comment: ri.comment,
          })),
        },
      },
    });
  }

  async update(entity: PerformanceReview): Promise<void> {
    const data = PerformanceReviewPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      await tx.performanceReview.update({
        where: { id: data.id },
        data: {
          reviewerEmploymentId: data.reviewerEmploymentId,
          workflowInstanceId: data.workflowInstanceId,
          overallRatingId: data.overallRatingId,
          overallScore: data.overallScore,
          status: data.status,
          comment: data.comment,
          updatedAt: data.updatedAt,
        },
      });

      // Sync review items
      await tx.performanceReviewItem.deleteMany({ where: { performanceReviewId: data.id } });
      if (entity.reviewItems.length > 0) {
        await tx.performanceReviewItem.createMany({
          data: entity.reviewItems.map((ri) => ({
            id: ri.id.toString(),
            performanceReviewId: data.id,
            goalId: ri.goalId ? ri.goalId.toString() : null,
            criteria: ri.criteria ?? null,
            ratingId: ri.ratingId ? ri.ratingId.toString() : null,
            score: ri.score !== undefined ? new Prisma.Decimal(ri.score) : null,
            comment: ri.comment ?? null,
          })),
        });
      }
    });
  }

  async delete(entity: PerformanceReview): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.performanceReviewItem.deleteMany({
        where: { performanceReviewId: entity.id.toString() },
      });
      await tx.performanceReview.delete({ where: { id: entity.id.toString() } });
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<PerformanceReview | null> {
    const record = await this.prisma.performanceReview.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
    });
    return record ? PerformanceReviewPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<PerformanceReview[]> {
    const records = await this.prisma.performanceReview.findMany({
      where: { tenantId: tenantId.toString(), employmentId: employmentId.toString() },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(PerformanceReviewPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<PerformanceReview[]> {
    const records = await this.prisma.performanceReview.findMany({
      where: { tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(PerformanceReviewPersistenceMapper.toDomain);
  }
}
