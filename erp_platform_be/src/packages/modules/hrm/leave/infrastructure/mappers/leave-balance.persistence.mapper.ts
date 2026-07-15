import { LeaveBalance as PrismaLeaveBalance, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveBalance } from '../../domain/aggregates/leave-balance.aggregate';

export class LeaveBalancePersistenceMapper {
  static toDomain(prisma: PrismaLeaveBalance): LeaveBalance {
    return LeaveBalance.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      leaveTypeId: Identifier.create(prisma.leaveTypeId),
      leaveYear: prisma.leaveYear,
      entitledDays: prisma.entitledDays ? Number(prisma.entitledDays.toString()) : 0,
      usedDays: prisma.usedDays ? Number(prisma.usedDays.toString()) : 0,
      pendingDays: prisma.pendingDays ? Number(prisma.pendingDays.toString()) : 0,
      remainingDays: prisma.remainingDays ? Number(prisma.remainingDays.toString()) : 0,
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: LeaveBalance): PrismaLeaveBalance {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      leaveYear: entity.leaveYear,
      entitledDays: new Prisma.Decimal(entity.entitledDays),
      usedDays: new Prisma.Decimal(entity.usedDays),
      pendingDays: new Prisma.Decimal(entity.pendingDays),
      remainingDays: new Prisma.Decimal(entity.remainingDays),
      updatedAt: entity.updatedAt,
    };
  }
}
