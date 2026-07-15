import { PayrollPeriod as PrismaPayrollPeriod, PayrollStatus } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PayrollPeriod } from '../../domain/aggregates/payroll-period.aggregate';

export class PayrollPeriodPersistenceMapper {
  static toDomain(prisma: PrismaPayrollPeriod): PayrollPeriod {
    return PayrollPeriod.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code ?? undefined,
      startDate: prisma.startDate ?? undefined,
      endDate: prisma.endDate ?? undefined,
      paymentDate: prisma.paymentDate ?? undefined,
      status: prisma.status ?? PayrollStatus.draft,
      createdAt: prisma.createdAt ?? new Date(),
    });
  }

  static toPersistence(entity: PayrollPeriod): PrismaPayrollPeriod {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code ?? null,
      startDate: entity.startDate ?? null,
      endDate: entity.endDate ?? null,
      paymentDate: entity.paymentDate ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
