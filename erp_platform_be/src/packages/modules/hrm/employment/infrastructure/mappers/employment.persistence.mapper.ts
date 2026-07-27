import {
  Employment as PrismaEmployment,
  EmploymentStatusHistory as PrismaHistory,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employment } from '../../domain/aggregates/employment.aggregate';
import { EmploymentStatusHistory } from '../../domain/entities/employment-status-history.entity';

export type PrismaEmploymentPayload = PrismaEmployment & {
  employmentStatusHistories?: PrismaHistory[];
};

export class EmploymentPersistenceMapper {
  static toDomain(prisma: PrismaEmploymentPayload): Employment {
    const id = Identifier.create(prisma.id);

    return Employment.rehydrate(id, {
      tenantId: Identifier.create(prisma.tenantId),
      employeeId: Identifier.create(prisma.employeeId),
      employmentTypeId: Identifier.create(prisma.employmentTypeId),
      employeeCode: prisma.employeeCode,
      hireDate: prisma.hireDate,
      probationStartDate: prisma.probationStartDate ?? undefined,
      probationEndDate: prisma.probationEndDate ?? undefined,
      confirmationDate: prisma.confirmationDate ?? undefined,
      terminationDate: prisma.terminationDate ?? undefined,
      status: prisma.status,
      reason: prisma.reason ?? undefined,
      metadata: prisma.metadata as Record<string, unknown> | undefined,

      statusHistory: (prisma.employmentStatusHistories ?? []).map((h) =>
        EmploymentStatusHistory.rehydrate(Identifier.create(h.id), {
          employmentId: id,
          fromStatus: h.fromStatus ?? undefined,
          toStatus: h.toStatus ?? undefined,
          effectiveDate: h.effectiveDate,
          reason: h.reason ?? undefined,
          changedByPrincipalId: h.changedByPrincipalId ?? undefined,
          createdAt: h.createdAt ?? new Date(),
        }),
      ),
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      deletedAt: prisma.deletedAt ?? undefined,
    });
  }

  static toPersistence(entity: Employment) {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employeeId: entity.employeeId.toString(),
      employmentTypeId: entity.employmentTypeId.toString(),
      employeeCode: entity.employeeCode,
      hireDate: entity.hireDate,
      probationStartDate: entity.probationStartDate ?? null,
      probationEndDate: entity.probationEndDate ?? null,
      confirmationDate: entity.confirmationDate ?? null,
      terminationDate: entity.terminationDate ?? null,
      status: entity.status,
      reason: entity.reason ?? null,
      metadata: entity.metadata as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    };
  }
}
