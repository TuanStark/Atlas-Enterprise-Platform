import { ShiftAssignment as PrismaShiftAssignment } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ShiftAssignment } from '../../domain/entities/shift-assignment.entity';

export class ShiftAssignmentPersistenceMapper {
  static toDomain(prisma: PrismaShiftAssignment): ShiftAssignment {
    return ShiftAssignment.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      shiftId: Identifier.create(prisma.shiftId),
      effectiveFrom: prisma.effectiveFrom,
      effectiveTo: prisma.effectiveTo ?? undefined,
      isPrimary: prisma.isPrimary ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: ShiftAssignment): PrismaShiftAssignment {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      shiftId: entity.shiftId.toString(),
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo ?? null,
      isPrimary: entity.isPrimary,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
