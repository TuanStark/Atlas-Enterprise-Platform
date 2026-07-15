import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingSession } from '../aggregates/training-session.aggregate';

export const TRAINING_SESSION_REPOSITORY = Symbol('TRAINING_SESSION_REPOSITORY');

export interface TrainingSessionRepository {
  save(entity: TrainingSession): Promise<void>;
  update(entity: TrainingSession): Promise<void>;
  delete(entity: TrainingSession): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<TrainingSession | null>;
  findAll(tenantId: Identifier): Promise<TrainingSession[]>;
}
