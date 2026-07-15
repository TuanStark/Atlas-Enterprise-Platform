import { Payroll as PrismaPayroll, PayrollItem as PrismaPayrollItem, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Payroll } from '../../domain/aggregates/payroll.aggregate';
import { PayrollItem } from '../../domain/entities/payroll-item.entity';

export type PrismaPayrollPayload = PrismaPayroll & {
  payrollItems?: PrismaPayrollItem[];
};

export class PayrollPersistenceMapper {
  static toDomain(prisma: PrismaPayrollPayload): Payroll {
    const payrollId = Identifier.create(prisma.id);

    return Payroll.rehydrate(payrollId, {
      tenantId: Identifier.create(prisma.tenantId),
      payrollPeriodId: Identifier.create(prisma.payrollPeriodId),
      employmentId: Identifier.create(prisma.employmentId),
      grossSalary: prisma.grossSalary ? prisma.grossSalary.toNumber() : undefined,
      totalAllowance: prisma.totalAllowance ? prisma.totalAllowance.toNumber() : undefined,
      totalDeduction: prisma.totalDeduction ? prisma.totalDeduction.toNumber() : undefined,
      netSalary: prisma.netSalary ? prisma.netSalary.toNumber() : undefined,
      status: prisma.status ?? undefined,
      payslipFileId: prisma.payslipFileId ? Identifier.create(prisma.payslipFileId) : undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      payrollItems: (prisma.payrollItems ?? []).map((pi) =>
        PayrollItem.rehydrate(Identifier.create(pi.id), {
          payrollId,
          salaryComponentId: Identifier.create(pi.salaryComponentId),
          amount: pi.amount ? pi.amount.toNumber() : undefined,
          remark: pi.remark ?? undefined,
        }),
      ),
    });
  }

  static toPersistence(entity: Payroll): PrismaPayroll {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      payrollPeriodId: entity.payrollPeriodId.toString(),
      employmentId: entity.employmentId.toString(),
      grossSalary: entity.grossSalary !== undefined ? new Prisma.Decimal(entity.grossSalary) : null,
      totalAllowance:
        entity.totalAllowance !== undefined ? new Prisma.Decimal(entity.totalAllowance) : null,
      totalDeduction:
        entity.totalDeduction !== undefined ? new Prisma.Decimal(entity.totalDeduction) : null,
      netSalary: entity.netSalary !== undefined ? new Prisma.Decimal(entity.netSalary) : null,
      status: entity.status ?? null,
      payslipFileId: entity.payslipFileId ? entity.payslipFileId.toString() : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
