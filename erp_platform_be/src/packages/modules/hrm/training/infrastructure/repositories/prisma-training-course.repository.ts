import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingCourse } from '../../domain/aggregates/training-course.aggregate';
import { TrainingCourseRepository } from '../../domain/repositories/training-course.repository';
import { TrainingCoursePersistenceMapper } from '../mappers/training-course.persistence.mapper';

@Injectable()
export class PrismaTrainingCourseRepository implements TrainingCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: TrainingCourse): Promise<void> {
    const data = TrainingCoursePersistenceMapper.toPersistence(entity);
    await this.prisma.trainingCourse.create({ data });
  }

  async update(entity: TrainingCourse): Promise<void> {
    const data = TrainingCoursePersistenceMapper.toPersistence(entity);
    await this.prisma.trainingCourse.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        durationHours: data.durationHours,
        description: data.description,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: TrainingCourse): Promise<void> {
    await this.prisma.trainingCourse.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<TrainingCourse | null> {
    const record = await this.prisma.trainingCourse.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? TrainingCoursePersistenceMapper.toDomain(record) : null;
  }

  async findByCode(tenantId: Identifier, code: string): Promise<TrainingCourse | null> {
    const record = await this.prisma.trainingCourse.findFirst({
      where: { tenantId: tenantId.toString(), code },
    });
    return record ? TrainingCoursePersistenceMapper.toDomain(record) : null;
  }

  async existsByCode(tenantId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.trainingCourse.count({
      where: { tenantId: tenantId.toString(), code },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<TrainingCourse[]> {
    const records = await this.prisma.trainingCourse.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { code: 'asc' },
    });
    return records.map(TrainingCoursePersistenceMapper.toDomain);
  }
}
