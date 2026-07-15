import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeavePolicy } from '../../domain/aggregates/leave-policy.aggregate';
import { LeavePolicyRepository } from '../../domain/repositories/leave-policy.repository';
import { LeavePolicyPersistenceMapper } from '../mappers/leave-policy.persistence.mapper';

@Injectable()
export class PrismaLeavePolicyRepository implements LeavePolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: LeavePolicy): Promise<void> {
    const data = LeavePolicyPersistenceMapper.toPersistence(entity);
    await this.prisma.leavePolicy.create({ data });
  }

  async update(entity: LeavePolicy): Promise<void> {
    const data = LeavePolicyPersistenceMapper.toPersistence(entity);
    await this.prisma.leavePolicy.update({
      where: { id: data.id },
      data: {
        annualDays: data.annualDays,
        maxConsecutiveDays: data.maxConsecutiveDays,
        carryForwardLimit: data.carryForwardLimit,
        requiresApproval: data.requiresApproval,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: LeavePolicy): Promise<void> {
    await this.prisma.leavePolicy.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<LeavePolicy | null> {
    const record = await this.prisma.leavePolicy.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? LeavePolicyPersistenceMapper.toDomain(record) : null;
  }

  async findByLeaveTypeAndEmploymentType(
    tenantId: Identifier,
    leaveTypeId: Identifier,
    employmentTypeId: Identifier,
  ): Promise<LeavePolicy | null> {
    const record = await this.prisma.leavePolicy.findFirst({
      where: {
        tenantId: tenantId.toString(),
        leaveTypeId: leaveTypeId.toString(),
        employmentTypeId: employmentTypeId.toString(),
      },
    });
    return record ? LeavePolicyPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<LeavePolicy[]> {
    const records = await this.prisma.leavePolicy.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(LeavePolicyPersistenceMapper.toDomain);
  }
}
