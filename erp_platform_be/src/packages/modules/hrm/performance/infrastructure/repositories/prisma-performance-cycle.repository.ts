import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceCycle } from '../../domain/aggregates/performance-cycle.aggregate';
import { PerformanceCycleRepository } from '../../domain/repositories/performance-cycle.repository';
import { PerformanceCyclePersistenceMapper } from '../mappers/performance-cycle.persistence.mapper';

@Injectable()
export class PrismaPerformanceCycleRepository implements PerformanceCycleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: PerformanceCycle): Promise<void> {
    const data = PerformanceCyclePersistenceMapper.toPersistence(entity);
    await this.prisma.performanceCycle.create({ data });
  }

  async update(entity: PerformanceCycle): Promise<void> {
    const data = PerformanceCyclePersistenceMapper.toPersistence(entity);
    await this.prisma.performanceCycle.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: PerformanceCycle): Promise<void> {
    await this.prisma.performanceCycle.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<PerformanceCycle | null> {
    const record = await this.prisma.performanceCycle.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? PerformanceCyclePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<PerformanceCycle | null> {
    const record = await this.prisma.performanceCycle.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? PerformanceCyclePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.performanceCycle.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<PerformanceCycle[]> {
    const records = await this.prisma.performanceCycle.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { startDate: 'desc' },
    });
    return records.map(PerformanceCyclePersistenceMapper.toDomain);
  }
}
