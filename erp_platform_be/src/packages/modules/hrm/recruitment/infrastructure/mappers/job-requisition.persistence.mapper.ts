import { JobRequisition as PrismaJobRequisition, RequisitionStatus } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobRequisition } from '../../domain/aggregates/job-requisition.aggregate';

export class JobRequisitionPersistenceMapper {
  static toDomain(prisma: PrismaJobRequisition): JobRequisition {
    return JobRequisition.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      title: prisma.title,
      departmentId: Identifier.create(prisma.departmentId),
      positionId: Identifier.create(prisma.positionId),
      requestedByEmploymentId: prisma.requestedByEmploymentId
        ? Identifier.create(prisma.requestedByEmploymentId)
        : undefined,
      quantity: prisma.quantity ?? undefined,
      status: prisma.status ?? RequisitionStatus.draft,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: JobRequisition): PrismaJobRequisition {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      title: entity.title,
      departmentId: entity.departmentId.toString(),
      positionId: entity.positionId.toString(),
      requestedByEmploymentId: entity.requestedByEmploymentId
        ? entity.requestedByEmploymentId.toString()
        : null,
      quantity: entity.quantity ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
