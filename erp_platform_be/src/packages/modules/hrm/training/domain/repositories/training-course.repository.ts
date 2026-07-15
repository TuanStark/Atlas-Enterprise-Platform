import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingCourse } from '../aggregates/training-course.aggregate';

export const TRAINING_COURSE_REPOSITORY = Symbol('TRAINING_COURSE_REPOSITORY');

export interface TrainingCourseRepository {
  save(entity: TrainingCourse): Promise<void>;
  update(entity: TrainingCourse): Promise<void>;
  delete(entity: TrainingCourse): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<TrainingCourse | null>;
  findByCode(tenantId: Identifier, code: string): Promise<TrainingCourse | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<TrainingCourse[]>;
}
