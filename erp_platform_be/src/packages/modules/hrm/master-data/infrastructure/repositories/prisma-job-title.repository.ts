import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobTitle } from '../../domain/entities/job-title.entity';
import { JobTitleRepository } from '../../domain/repositories/job-title.repository';
import { JobTitlePersistenceMapper } from '../mappers/job-title.persistence.mapper';

@Injectable()
export class PrismaJobTitleRepository implements JobTitleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: JobTitle): Promise<void> {
    const data = JobTitlePersistenceMapper.toPersistence(entity);
    await this.prisma.jobTitle.create({ data });
  }

  async update(entity: JobTitle): Promise<void> {
    const data = JobTitlePersistenceMapper.toPersistence(entity);
    await this.prisma.jobTitle.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: JobTitle): Promise<void> {
    await this.prisma.jobTitle.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<JobTitle | null> {
    const record = await this.prisma.jobTitle.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? JobTitlePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<JobTitle | null> {
    const record = await this.prisma.jobTitle.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? JobTitlePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.jobTitle.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<JobTitle[]> {
    const records = await this.prisma.jobTitle.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(JobTitlePersistenceMapper.toDomain);
  }
}
