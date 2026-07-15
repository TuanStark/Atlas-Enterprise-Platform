import { EmploymentType as PrismaEmploymentType } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmploymentType } from '../../domain/entities/employment-type.entity';

export class EmploymentTypePersistenceMapper {
  static toDomain(prisma: PrismaEmploymentType): EmploymentType {
    return EmploymentType.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      description: prisma.description ?? undefined,
      isActive: prisma.isActive ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: EmploymentType): PrismaEmploymentType {
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
