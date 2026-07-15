import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PayrollPeriod } from '../../domain/aggregates/payroll-period.aggregate';
import { PayrollPeriodRepository } from '../../domain/repositories/payroll-period.repository';
import { PayrollPeriodPersistenceMapper } from '../mappers/payroll-period.persistence.mapper';

@Injectable()
export class PrismaPayrollPeriodRepository implements PayrollPeriodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: PayrollPeriod): Promise<void> {
    const data = PayrollPeriodPersistenceMapper.toPersistence(entity);
    await this.prisma.payrollPeriod.create({ data });
  }

  async update(entity: PayrollPeriod): Promise<void> {
    const data = PayrollPeriodPersistenceMapper.toPersistence(entity);
    await this.prisma.payrollPeriod.update({
      where: { id: data.id },
      data: {
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        paymentDate: data.paymentDate,
        status: data.status,
      },
    });
  }

  async delete(entity: PayrollPeriod): Promise<void> {
    await this.prisma.payrollPeriod.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<PayrollPeriod | null> {
    const record = await this.prisma.payrollPeriod.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? PayrollPeriodPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<PayrollPeriod[]> {
    const records = await this.prisma.payrollPeriod.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { startDate: 'desc' },
    });
    return records.map(PayrollPeriodPersistenceMapper.toDomain);
  }
}
