import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmploymentType } from '../../domain/entities/employment-type.entity';
import { EmploymentTypeRepository } from '../../domain/repositories/employment-type.repository';
import { EmploymentTypePersistenceMapper } from '../mappers/employment-type.persistence.mapper';

@Injectable()
export class PrismaEmploymentTypeRepository implements EmploymentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: EmploymentType): Promise<void> {
    const data = EmploymentTypePersistenceMapper.toPersistence(entity);
    await this.prisma.employmentType.create({ data });
  }

  async update(entity: EmploymentType): Promise<void> {
    const data = EmploymentTypePersistenceMapper.toPersistence(entity);
    await this.prisma.employmentType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: EmploymentType): Promise<void> {
    await this.prisma.employmentType.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<EmploymentType | null> {
    const record = await this.prisma.employmentType.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? EmploymentTypePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<EmploymentType | null> {
    const record = await this.prisma.employmentType.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? EmploymentTypePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.employmentType.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<EmploymentType[]> {
    const records = await this.prisma.employmentType.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(EmploymentTypePersistenceMapper.toDomain);
  }
}
