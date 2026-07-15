import { JobPosting as PrismaJobPosting } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobPosting } from '../../domain/aggregates/job-posting.aggregate';

export class JobPostingPersistenceMapper {
  static toDomain(prisma: PrismaJobPosting): JobPosting {
    return JobPosting.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      requisitionId: Identifier.create(prisma.requisitionId),
      title: prisma.title ?? undefined,
      description: prisma.description ?? undefined,
      publishedAt: prisma.publishedAt ?? undefined,
      expiredAt: prisma.expiredAt ?? undefined,
      isActive: prisma.isActive ?? true,
    });
  }

  static toPersistence(entity: JobPosting): PrismaJobPosting {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      requisitionId: entity.requisitionId.toString(),
      title: entity.title ?? null,
      description: entity.description ?? null,
      publishedAt: entity.publishedAt ?? null,
      expiredAt: entity.expiredAt ?? null,
      isActive: entity.isActive,
    };
  }
}
