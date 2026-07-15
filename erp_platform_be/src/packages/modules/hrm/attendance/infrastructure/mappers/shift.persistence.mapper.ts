import { Shift as PrismaShift } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Shift } from '../../domain/aggregates/shift.aggregate';

export class ShiftPersistenceMapper {
  static toDomain(prisma: PrismaShift): Shift {
    return Shift.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      startTime: prisma.startTime,
      endTime: prisma.endTime,
      breakMinutes: prisma.breakMinutes ?? 60,
      isFlexible: prisma.isFlexible ?? false,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: Shift): PrismaShift {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      startTime: entity.startTime,
      endTime: entity.endTime,
      breakMinutes: entity.breakMinutes,
      isFlexible: entity.isFlexible,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
