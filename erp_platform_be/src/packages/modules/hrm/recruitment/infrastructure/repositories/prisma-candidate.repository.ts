import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Candidate } from '../../domain/aggregates/candidate.aggregate';
import { CandidateRepository } from '../../domain/repositories/candidate.repository';
import { CandidatePersistenceMapper } from '../mappers/candidate.persistence.mapper';

@Injectable()
export class PrismaCandidateRepository implements CandidateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: Candidate): Promise<void> {
    const data = CandidatePersistenceMapper.toPersistence(entity);
    await this.prisma.candidate.create({ data });
  }

  async update(entity: Candidate): Promise<void> {
    const data = CandidatePersistenceMapper.toPersistence(entity);
    await this.prisma.candidate.update({
      where: { id: data.id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        source: data.source,
        resumeFileId: data.resumeFileId,
      },
    });
  }

  async delete(entity: Candidate): Promise<void> {
    await this.prisma.candidate.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? CandidatePersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<Candidate[]> {
    const records = await this.prisma.candidate.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(CandidatePersistenceMapper.toDomain);
  }
}
