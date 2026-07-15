import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Shift } from '../../domain/aggregates/shift.aggregate';
import { ShiftRepository } from '../../domain/repositories/shift.repository';
import { ShiftPersistenceMapper } from '../mappers/shift.persistence.mapper';

@Injectable()
export class PrismaShiftRepository implements ShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: Shift): Promise<void> {
    const data = ShiftPersistenceMapper.toPersistence(entity);
    await this.prisma.shift.create({ data });
  }

  async update(entity: Shift): Promise<void> {
    const data = ShiftPersistenceMapper.toPersistence(entity);
    await this.prisma.shift.update({
      where: { id: data.id },
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        breakMinutes: data.breakMinutes,
        isFlexible: data.isFlexible,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: Shift): Promise<void> {
    await this.prisma.shift.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<Shift | null> {
    const record = await this.prisma.shift.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? ShiftPersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<Shift | null> {
    const record = await this.prisma.shift.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? ShiftPersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.shift.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<Shift[]> {
    const records = await this.prisma.shift.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(ShiftPersistenceMapper.toDomain);
  }
}
