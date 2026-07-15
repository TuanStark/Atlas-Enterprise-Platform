import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryComponent } from '../../domain/aggregates/salary-component.aggregate';
import { SalaryComponentRepository } from '../../domain/repositories/salary-component.repository';
import { SalaryComponentPersistenceMapper } from '../mappers/salary-component.persistence.mapper';

@Injectable()
export class PrismaSalaryComponentRepository implements SalaryComponentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: SalaryComponent): Promise<void> {
    const data = SalaryComponentPersistenceMapper.toPersistence(entity);
    await this.prisma.salaryComponent.create({ data });
  }

  async update(entity: SalaryComponent): Promise<void> {
    const data = SalaryComponentPersistenceMapper.toPersistence(entity);
    await this.prisma.salaryComponent.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        componentType: data.componentType,
        calculationType: data.calculationType,
        defaultAmount: data.defaultAmount,
        taxable: data.taxable,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: SalaryComponent): Promise<void> {
    await this.prisma.salaryComponent.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<SalaryComponent | null> {
    const record = await this.prisma.salaryComponent.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? SalaryComponentPersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<SalaryComponent | null> {
    const record = await this.prisma.salaryComponent.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? SalaryComponentPersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.salaryComponent.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<SalaryComponent[]> {
    const records = await this.prisma.salaryComponent.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(SalaryComponentPersistenceMapper.toDomain);
  }
}
