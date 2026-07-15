import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobRequisition } from '../../domain/aggregates/job-requisition.aggregate';
import { JobRequisitionRepository } from '../../domain/repositories/job-requisition.repository';
import { JobRequisitionPersistenceMapper } from '../mappers/job-requisition.persistence.mapper';

@Injectable()
export class PrismaJobRequisitionRepository implements JobRequisitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: JobRequisition): Promise<void> {
    const data = JobRequisitionPersistenceMapper.toPersistence(entity);
    await this.prisma.jobRequisition.create({ data });
  }

  async update(entity: JobRequisition): Promise<void> {
    const data = JobRequisitionPersistenceMapper.toPersistence(entity);
    await this.prisma.jobRequisition.update({
      where: { id: data.id },
      data: {
        code: data.code,
        title: data.title,
        departmentId: data.departmentId,
        positionId: data.positionId,
        requestedByEmploymentId: data.requestedByEmploymentId,
        quantity: data.quantity,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: JobRequisition): Promise<void> {
    await this.prisma.jobRequisition.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<JobRequisition | null> {
    const record = await this.prisma.jobRequisition.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? JobRequisitionPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<JobRequisition[]> {
    const records = await this.prisma.jobRequisition.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(JobRequisitionPersistenceMapper.toDomain);
  }
}
