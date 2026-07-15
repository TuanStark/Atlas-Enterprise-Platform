import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ContractType } from '../../domain/entities/contract-type.entity';
import { ContractTypeRepository } from '../../domain/repositories/contract-type.repository';
import { ContractTypePersistenceMapper } from '../mappers/contract-type.persistence.mapper';

@Injectable()
export class PrismaContractTypeRepository implements ContractTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: ContractType): Promise<void> {
    const data = ContractTypePersistenceMapper.toPersistence(entity);
    await this.prisma.contractType.create({ data });
  }

  async update(entity: ContractType): Promise<void> {
    const data = ContractTypePersistenceMapper.toPersistence(entity);
    await this.prisma.contractType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        durationMonth: data.durationMonth,
        description: data.description,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: ContractType): Promise<void> {
    await this.prisma.contractType.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<ContractType | null> {
    const record = await this.prisma.contractType.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? ContractTypePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<ContractType | null> {
    const record = await this.prisma.contractType.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? ContractTypePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.contractType.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<ContractType[]> {
    const records = await this.prisma.contractType.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(ContractTypePersistenceMapper.toDomain);
  }
}
