import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingEnrollment } from '../aggregates/training-enrollment.aggregate';

export const TRAINING_ENROLLMENT_REPOSITORY = Symbol('TRAINING_ENROLLMENT_REPOSITORY');

export interface TrainingEnrollmentRepository {
  save(entity: TrainingEnrollment): Promise<void>;
  update(entity: TrainingEnrollment): Promise<void>;
  delete(entity: TrainingEnrollment): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<TrainingEnrollment | null>;
  findBySessionId(tenantId: Identifier, sessionId: Identifier): Promise<TrainingEnrollment[]>;
  findAll(tenantId: Identifier): Promise<TrainingEnrollment[]>;
}
