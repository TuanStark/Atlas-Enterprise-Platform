import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobPosting } from '../../domain/aggregates/job-posting.aggregate';
import { JobPostingRepository } from '../../domain/repositories/job-posting.repository';
import { JobPostingPersistenceMapper } from '../mappers/job-posting.persistence.mapper';

@Injectable()
export class PrismaJobPostingRepository implements JobPostingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: JobPosting): Promise<void> {
    const data = JobPostingPersistenceMapper.toPersistence(entity);
    await this.prisma.jobPosting.create({ data });
  }

  async update(entity: JobPosting): Promise<void> {
    const data = JobPostingPersistenceMapper.toPersistence(entity);
    await this.prisma.jobPosting.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        expiredAt: data.expiredAt,
        isActive: data.isActive,
      },
    });
  }

  async delete(entity: JobPosting): Promise<void> {
    await this.prisma.jobPosting.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<JobPosting | null> {
    const record = await this.prisma.jobPosting.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? JobPostingPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<JobPosting[]> {
    const records = await this.prisma.jobPosting.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { publishedAt: 'desc' },
    });
    return records.map(JobPostingPersistenceMapper.toDomain);
  }
}
