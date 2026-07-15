import { JobTitle as PrismaJobTitle } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobTitle } from '../../domain/entities/job-title.entity';

export class JobTitlePersistenceMapper {
  static toDomain(prisma: PrismaJobTitle): JobTitle {
    return JobTitle.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      description: prisma.description ?? undefined,
      isActive: prisma.isActive ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: JobTitle): PrismaJobTitle {
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
