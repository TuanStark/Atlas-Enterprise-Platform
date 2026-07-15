import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryStructure } from '../../domain/aggregates/salary-structure.aggregate';
import { SalaryStructureRepository } from '../../domain/repositories/salary-structure.repository';
import { SalaryStructurePersistenceMapper } from '../mappers/salary-structure.persistence.mapper';

@Injectable()
export class PrismaSalaryStructureRepository implements SalaryStructureRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: SalaryStructure): Promise<void> {
    const data = SalaryStructurePersistenceMapper.toPersistence(entity);
    await this.prisma.salaryStructure.create({ data });
  }

  async update(entity: SalaryStructure): Promise<void> {
    const data = SalaryStructurePersistenceMapper.toPersistence(entity);
    await this.prisma.salaryStructure.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: SalaryStructure): Promise<void> {
    await this.prisma.salaryStructure.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<SalaryStructure | null> {
    const record = await this.prisma.salaryStructure.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? SalaryStructurePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<SalaryStructure | null> {
    const record = await this.prisma.salaryStructure.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? SalaryStructurePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.salaryStructure.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<SalaryStructure[]> {
    const records = await this.prisma.salaryStructure.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(SalaryStructurePersistenceMapper.toDomain);
  }
}
