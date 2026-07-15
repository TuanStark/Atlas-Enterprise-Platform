import { SalaryStructure as PrismaSalaryStructure } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryStructure } from '../../domain/aggregates/salary-structure.aggregate';

export class SalaryStructurePersistenceMapper {
  static toDomain(prisma: PrismaSalaryStructure): SalaryStructure {
    return SalaryStructure.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      description: prisma.description ?? undefined,
      isActive: prisma.isActive ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: SalaryStructure): PrismaSalaryStructure {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
