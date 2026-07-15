import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Payroll } from '../../domain/aggregates/payroll.aggregate';
import { PayrollRepository } from '../../domain/repositories/payroll.repository';
import { PayrollPersistenceMapper } from '../mappers/payroll.persistence.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaPayrollRepository implements PayrollRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    payrollItems: true,
  };

  async save(entity: Payroll): Promise<void> {
    const data = PayrollPersistenceMapper.toPersistence(entity);

    await this.prisma.payroll.create({
      data: {
        ...data,
        payrollItems: {
          create: entity.payrollItems.map((pi) => ({
            id: pi.id.toString(),
            salaryComponentId: pi.salaryComponentId.toString(),
            amount: pi.amount !== undefined ? new Prisma.Decimal(pi.amount) : null,
            remark: pi.remark,
          })),
        },
      },
    });
  }

  async update(entity: Payroll): Promise<void> {
    const data = PayrollPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      await tx.payroll.update({
        where: { id: data.id },
        data: {
          grossSalary: data.grossSalary,
          totalAllowance: data.totalAllowance,
          totalDeduction: data.totalDeduction,
          netSalary: data.netSalary,
          status: data.status,
          payslipFileId: data.payslipFileId,
          updatedAt: data.updatedAt,
        },
      });

      // Sync payroll items
      await tx.payrollItem.deleteMany({ where: { payrollId: data.id } });
      if (entity.payrollItems.length > 0) {
        await tx.payrollItem.createMany({
          data: entity.payrollItems.map((pi) => ({
            id: pi.id.toString(),
            payrollId: data.id,
            salaryComponentId: pi.salaryComponentId.toString(),
            amount: pi.amount !== undefined ? new Prisma.Decimal(pi.amount) : null,
            remark: pi.remark ?? null,
          })),
        });
      }
    });
  }

  async delete(entity: Payroll): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.payrollItem.deleteMany({ where: { payrollId: entity.id.toString() } });
      await tx.payroll.delete({ where: { id: entity.id.toString() } });
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<Payroll | null> {
    const record = await this.prisma.payroll.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
    });
    return record ? PayrollPersistenceMapper.toDomain(record) : null;
  }

  async findByPeriodAndEmployment(
    tenantId: Identifier,
    periodId: Identifier,
    employmentId: Identifier,
  ): Promise<Payroll | null> {
    const record = await this.prisma.payroll.findFirst({
      where: {
        tenantId: tenantId.toString(),
        payrollPeriodId: periodId.toString(),
        employmentId: employmentId.toString(),
      },
      include: this.includeRelations,
    });
    return record ? PayrollPersistenceMapper.toDomain(record) : null;
  }

  async findByPeriod(tenantId: Identifier, periodId: Identifier): Promise<Payroll[]> {
    const records = await this.prisma.payroll.findMany({
      where: { tenantId: tenantId.toString(), payrollPeriodId: periodId.toString() },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(PayrollPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<Payroll[]> {
    const records = await this.prisma.payroll.findMany({
      where: { tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(PayrollPersistenceMapper.toDomain);
  }
}
