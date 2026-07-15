import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Candidate } from '../aggregates/candidate.aggregate';

export const CANDIDATE_REPOSITORY = Symbol('CANDIDATE_REPOSITORY');

export interface CandidateRepository {
  save(entity: Candidate): Promise<void>;
  update(entity: Candidate): Promise<void>;
  delete(entity: Candidate): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<Candidate | null>;
  findAll(tenantId: Identifier): Promise<Candidate[]>;
}
