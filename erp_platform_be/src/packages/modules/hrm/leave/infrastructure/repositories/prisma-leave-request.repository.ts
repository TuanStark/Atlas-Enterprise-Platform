import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveRequest } from '../../domain/aggregates/leave-request.aggregate';
import { LeaveRequestRepository } from '../../domain/repositories/leave-request.repository';
import { LeaveRequestPersistenceMapper } from '../mappers/leave-request.persistence.mapper';

@Injectable()
export class PrismaLeaveRequestRepository implements LeaveRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: LeaveRequest): Promise<void> {
    const data = LeaveRequestPersistenceMapper.toPersistence(entity);
    await this.prisma.leaveRequest.create({ data });
  }

  async update(entity: LeaveRequest): Promise<void> {
    const data = LeaveRequestPersistenceMapper.toPersistence(entity);
    await this.prisma.leaveRequest.update({
      where: { id: data.id },
      data: {
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: LeaveRequest): Promise<void> {
    await this.prisma.leaveRequest.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<LeaveRequest | null> {
    const record = await this.prisma.leaveRequest.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? LeaveRequestPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<LeaveRequest[]> {
    const records = await this.prisma.leaveRequest.findMany({
      where: { employmentId: employmentId.toString(), tenantId: tenantId.toString() },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(LeaveRequestPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<LeaveRequest[]> {
    const records = await this.prisma.leaveRequest.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(LeaveRequestPersistenceMapper.toDomain);
  }
}
