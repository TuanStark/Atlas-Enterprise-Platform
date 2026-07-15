import { LeaveRequest as PrismaLeaveRequest, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveRequest } from '../../domain/aggregates/leave-request.aggregate';

export class LeaveRequestPersistenceMapper {
  static toDomain(prisma: PrismaLeaveRequest): LeaveRequest {
    return LeaveRequest.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      leaveTypeId: Identifier.create(prisma.leaveTypeId),
      workflowInstanceId: prisma.workflowInstanceId
        ? Identifier.create(prisma.workflowInstanceId)
        : undefined,
      startDate: prisma.startDate,
      endDate: prisma.endDate,
      totalDays: prisma.totalDays ? Number(prisma.totalDays.toString()) : 0,
      reason: prisma.reason ?? undefined,
      status: prisma.status ?? 'pending',
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: LeaveRequest): PrismaLeaveRequest {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      workflowInstanceId: entity.workflowInstanceId ? entity.workflowInstanceId.toString() : null,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalDays: new Prisma.Decimal(entity.totalDays),
      reason: entity.reason ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
