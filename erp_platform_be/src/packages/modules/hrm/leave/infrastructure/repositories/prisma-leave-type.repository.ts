import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveType } from '../../domain/aggregates/leave-type.aggregate';
import { LeaveTypeRepository } from '../../domain/repositories/leave-type.repository';
import { LeaveTypePersistenceMapper } from '../mappers/leave-type.persistence.mapper';

@Injectable()
export class PrismaLeaveTypeRepository implements LeaveTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: LeaveType): Promise<void> {
    const data = LeaveTypePersistenceMapper.toPersistence(entity);
    await this.prisma.leaveType.create({ data });
  }

  async update(entity: LeaveType): Promise<void> {
    const data = LeaveTypePersistenceMapper.toPersistence(entity);
    await this.prisma.leaveType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        isPaid: data.isPaid,
        requiresAttachment: data.requiresAttachment,
        color: data.color,
        description: data.description,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: LeaveType): Promise<void> {
    await this.prisma.leaveType.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<LeaveType | null> {
    const record = await this.prisma.leaveType.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? LeaveTypePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<LeaveType | null> {
    const record = await this.prisma.leaveType.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? LeaveTypePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.leaveType.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<LeaveType[]> {
    const records = await this.prisma.leaveType.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(LeaveTypePersistenceMapper.toDomain);
  }
}
