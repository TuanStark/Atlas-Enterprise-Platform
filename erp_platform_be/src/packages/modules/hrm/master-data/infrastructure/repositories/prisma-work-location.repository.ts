import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { WorkLocation } from '../../domain/entities/work-location.entity';
import { WorkLocationRepository } from '../../domain/repositories/work-location.repository';
import { WorkLocationPersistenceMapper } from '../mappers/work-location.persistence.mapper';

@Injectable()
export class PrismaWorkLocationRepository implements WorkLocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: WorkLocation): Promise<void> {
    const data = WorkLocationPersistenceMapper.toPersistence(entity);
    await this.prisma.workLocation.create({ data });
  }

  async update(entity: WorkLocation): Promise<void> {
    const data = WorkLocationPersistenceMapper.toPersistence(entity);
    await this.prisma.workLocation.update({
      where: { id: data.id },
      data: {
        name: data.name,
        address: data.address,
        timezone: data.timezone,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: WorkLocation): Promise<void> {
    await this.prisma.workLocation.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<WorkLocation | null> {
    const record = await this.prisma.workLocation.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? WorkLocationPersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<WorkLocation | null> {
    const record = await this.prisma.workLocation.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? WorkLocationPersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.workLocation.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<WorkLocation[]> {
    const records = await this.prisma.workLocation.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(WorkLocationPersistenceMapper.toDomain);
  }
}
