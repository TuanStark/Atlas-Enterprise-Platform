import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveBalance } from '../../domain/aggregates/leave-balance.aggregate';
import { LeaveBalanceRepository } from '../../domain/repositories/leave-balance.repository';
import { LeaveBalancePersistenceMapper } from '../mappers/leave-balance.persistence.mapper';

@Injectable()
export class PrismaLeaveBalanceRepository implements LeaveBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: LeaveBalance): Promise<void> {
    const data = LeaveBalancePersistenceMapper.toPersistence(entity);
    await this.prisma.leaveBalance.create({ data });
  }

  async update(entity: LeaveBalance): Promise<void> {
    const data = LeaveBalancePersistenceMapper.toPersistence(entity);
    await this.prisma.leaveBalance.update({
      where: { id: data.id },
      data: {
        entitledDays: data.entitledDays,
        usedDays: data.usedDays,
        pendingDays: data.pendingDays,
        remainingDays: data.remainingDays,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: LeaveBalance): Promise<void> {
    await this.prisma.leaveBalance.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<LeaveBalance | null> {
    const record = await this.prisma.leaveBalance.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? LeaveBalancePersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentAndTypeAndYear(
    tenantId: Identifier,
    employmentId: Identifier,
    leaveTypeId: Identifier,
    year: number,
  ): Promise<LeaveBalance | null> {
    const record = await this.prisma.leaveBalance.findFirst({
      where: {
        tenantId: tenantId.toString(),
        employmentId: employmentId.toString(),
        leaveTypeId: leaveTypeId.toString(),
        leaveYear: year,
      },
    });
    return record ? LeaveBalancePersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<LeaveBalance[]> {
    const records = await this.prisma.leaveBalance.findMany({
      where: { employmentId: employmentId.toString(), tenantId: tenantId.toString() },
      orderBy: { leaveYear: 'desc' },
    });
    return records.map(LeaveBalancePersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<LeaveBalance[]> {
    const records = await this.prisma.leaveBalance.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { leaveYear: 'desc' },
    });
    return records.map(LeaveBalancePersistenceMapper.toDomain);
  }
}
