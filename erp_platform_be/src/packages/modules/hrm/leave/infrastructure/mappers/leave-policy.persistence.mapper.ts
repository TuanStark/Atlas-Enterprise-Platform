import { LeavePolicy as PrismaLeavePolicy, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeavePolicy } from '../../domain/aggregates/leave-policy.aggregate';

export class LeavePolicyPersistenceMapper {
  static toDomain(prisma: PrismaLeavePolicy): LeavePolicy {
    return LeavePolicy.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      leaveTypeId: Identifier.create(prisma.leaveTypeId),
      employmentTypeId: prisma.employmentTypeId
        ? Identifier.create(prisma.employmentTypeId)
        : undefined,
      annualDays: prisma.annualDays ? Number(prisma.annualDays.toString()) : 12,
      maxConsecutiveDays: prisma.maxConsecutiveDays ?? undefined,
      carryForwardLimit: prisma.carryForwardLimit
        ? Number(prisma.carryForwardLimit.toString())
        : undefined,
      requiresApproval: prisma.requiresApproval ?? true,
      effectiveFrom: prisma.effectiveFrom ?? undefined,
      effectiveTo: prisma.effectiveTo ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: LeavePolicy): PrismaLeavePolicy {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      employmentTypeId: entity.employmentTypeId ? entity.employmentTypeId.toString() : null,
      annualDays: new Prisma.Decimal(entity.annualDays),
      maxConsecutiveDays: entity.maxConsecutiveDays ?? null,
      carryForwardLimit: entity.carryForwardLimit
        ? new Prisma.Decimal(entity.carryForwardLimit)
        : null,
      requiresApproval: entity.requiresApproval,
      effectiveFrom: entity.effectiveFrom ?? null,
      effectiveTo: entity.effectiveTo ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
