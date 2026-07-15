import { Candidate as PrismaCandidate } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Candidate } from '../../domain/aggregates/candidate.aggregate';

export class CandidatePersistenceMapper {
  static toDomain(prisma: PrismaCandidate): Candidate {
    return Candidate.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      fullName: prisma.fullName ?? undefined,
      email: prisma.email ?? undefined,
      phone: prisma.phone ?? undefined,
      source: prisma.source ?? undefined,
      resumeFileId: prisma.resumeFileId ? Identifier.create(prisma.resumeFileId) : undefined,
      createdAt: prisma.createdAt ?? new Date(),
    });
  }

  static toPersistence(entity: Candidate): PrismaCandidate {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      fullName: entity.fullName ?? null,
      email: entity.email ?? null,
      phone: entity.phone ?? null,
      source: entity.source ?? null,
      resumeFileId: entity.resumeFileId ? entity.resumeFileId.toString() : null,
      createdAt: entity.createdAt,
    };
  }
}
