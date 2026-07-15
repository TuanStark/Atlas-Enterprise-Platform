import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ShiftAssignment } from '../../domain/entities/shift-assignment.entity';
import { ShiftAssignmentRepository } from '../../domain/repositories/shift-assignment.repository';
import { ShiftAssignmentPersistenceMapper } from '../mappers/shift-assignment.persistence.mapper';

@Injectable()
export class PrismaShiftAssignmentRepository implements ShiftAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: ShiftAssignment): Promise<void> {
    const data = ShiftAssignmentPersistenceMapper.toPersistence(entity);
    await this.prisma.shiftAssignment.create({ data });
  }

  async update(entity: ShiftAssignment): Promise<void> {
    const data = ShiftAssignmentPersistenceMapper.toPersistence(entity);
    await this.prisma.shiftAssignment.update({
      where: { id: data.id },
      data: {
        shiftId: data.shiftId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        isPrimary: data.isPrimary,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: ShiftAssignment): Promise<void> {
    await this.prisma.shiftAssignment.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<ShiftAssignment | null> {
    const record = await this.prisma.shiftAssignment.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? ShiftAssignmentPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<ShiftAssignment[]> {
    const records = await this.prisma.shiftAssignment.findMany({
      where: { employmentId: employmentId.toString(), tenantId: tenantId.toString() },
      orderBy: { effectiveFrom: 'desc' },
    });
    return records.map(ShiftAssignmentPersistenceMapper.toDomain);
  }

  async findActiveByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
    date: Date,
  ): Promise<ShiftAssignment | null> {
    // Normalise date to midnight for comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const record = await this.prisma.shiftAssignment.findFirst({
      where: {
        tenantId: tenantId.toString(),
        employmentId: employmentId.toString(),
        isPrimary: true,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
      },
    });
    return record ? ShiftAssignmentPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<ShiftAssignment[]> {
    const records = await this.prisma.shiftAssignment.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { effectiveFrom: 'desc' },
    });
    return records.map(ShiftAssignmentPersistenceMapper.toDomain);
  }
}
