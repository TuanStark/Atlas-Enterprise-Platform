import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingSession } from '../../domain/aggregates/training-session.aggregate';
import { TrainingSessionRepository } from '../../domain/repositories/training-session.repository';
import { TrainingSessionPersistenceMapper } from '../mappers/training-session.persistence.mapper';

@Injectable()
export class PrismaTrainingSessionRepository implements TrainingSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: TrainingSession): Promise<void> {
    const data = TrainingSessionPersistenceMapper.toPersistence(entity);
    await this.prisma.trainingSession.create({ data });
  }

  async update(entity: TrainingSession): Promise<void> {
    const data = TrainingSessionPersistenceMapper.toPersistence(entity);
    await this.prisma.trainingSession.update({
      where: { id: data.id },
      data: {
        instructorEmploymentId: data.instructorEmploymentId,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        capacity: data.capacity,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: TrainingSession): Promise<void> {
    await this.prisma.trainingSession.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<TrainingSession | null> {
    const record = await this.prisma.trainingSession.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? TrainingSessionPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<TrainingSession[]> {
    const records = await this.prisma.trainingSession.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { startDate: 'desc' },
    });
    return records.map(TrainingSessionPersistenceMapper.toDomain);
  }
}
