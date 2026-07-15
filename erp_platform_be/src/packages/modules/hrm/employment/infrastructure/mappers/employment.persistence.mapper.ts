import {
  Employment as PrismaEmployment,
  EmploymentContract as PrismaContract,
  EmploymentStatusHistory as PrismaHistory,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employment } from '../../domain/aggregates/employment.aggregate';
import { EmploymentContract } from '../../domain/entities/employment-contract.entity';
import { EmploymentStatusHistory } from '../../domain/entities/employment-status-history.entity';

export type PrismaEmploymentPayload = PrismaEmployment & {
  employmentContracts?: PrismaContract[];
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
      contracts: (prisma.employmentContracts ?? []).map((c) =>
        EmploymentContract.rehydrate(Identifier.create(c.id), {
          employmentId: id,
          contractTypeId: Identifier.create(c.contractTypeId),
          contractNumber: c.contractNumber,
          startDate: c.startDate,
          endDate: c.endDate ?? undefined,
          signedDate: c.signedDate ?? undefined,
          fileId: c.fileId ?? undefined,
          isCurrent: c.isCurrent ?? true,
          createdAt: c.createdAt ?? new Date(),
          updatedAt: c.updatedAt ?? new Date(),
        }),
      ),
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
