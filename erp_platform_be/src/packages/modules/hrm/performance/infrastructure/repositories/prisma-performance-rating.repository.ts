import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceRating } from '../../domain/aggregates/performance-rating.aggregate';
import { PerformanceRatingRepository } from '../../domain/repositories/performance-rating.repository';
import { PerformanceRatingPersistenceMapper } from '../mappers/performance-rating.persistence.mapper';

@Injectable()
export class PrismaPerformanceRatingRepository implements PerformanceRatingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: PerformanceRating): Promise<void> {
    const data = PerformanceRatingPersistenceMapper.toPersistence(entity);
    await this.prisma.performanceRating.create({ data });
  }

  async update(entity: PerformanceRating): Promise<void> {
    const data = PerformanceRatingPersistenceMapper.toPersistence(entity);
    await this.prisma.performanceRating.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        score: data.score,
        description: data.description,
      },
    });
  }

  async delete(entity: PerformanceRating): Promise<void> {
    await this.prisma.performanceRating.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<PerformanceRating | null> {
    const record = await this.prisma.performanceRating.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? PerformanceRatingPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<PerformanceRating[]> {
    const records = await this.prisma.performanceRating.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { score: 'asc' },
    });
    return records.map(PerformanceRatingPersistenceMapper.toDomain);
  }
}
