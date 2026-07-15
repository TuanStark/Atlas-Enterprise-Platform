import { ContractType as PrismaContractType } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ContractType } from '../../domain/entities/contract-type.entity';

export class ContractTypePersistenceMapper {
  static toDomain(prisma: PrismaContractType): ContractType {
    return ContractType.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      durationMonth: prisma.durationMonth ?? undefined,
      description: prisma.description ?? undefined,
      isActive: prisma.isActive ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: ContractType): PrismaContractType {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      durationMonth: entity.durationMonth ?? null,
      description: entity.description ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
