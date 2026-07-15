import { LeaveType as PrismaLeaveType } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveType } from '../../domain/aggregates/leave-type.aggregate';

export class LeaveTypePersistenceMapper {
  static toDomain(prisma: PrismaLeaveType): LeaveType {
    return LeaveType.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      isPaid: prisma.isPaid ?? true,
      requiresAttachment: prisma.requiresAttachment ?? false,
      color: prisma.color ?? undefined,
      description: prisma.description ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: LeaveType): PrismaLeaveType {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      isPaid: entity.isPaid,
      requiresAttachment: entity.requiresAttachment,
      color: entity.color ?? null,
      description: entity.description ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
