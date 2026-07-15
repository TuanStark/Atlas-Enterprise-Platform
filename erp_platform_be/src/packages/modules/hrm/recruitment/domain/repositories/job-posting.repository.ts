import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobPosting } from '../aggregates/job-posting.aggregate';

export const JOB_POSTING_REPOSITORY = Symbol('JOB_POSTING_REPOSITORY');

export interface JobPostingRepository {
  save(entity: JobPosting): Promise<void>;
  update(entity: JobPosting): Promise<void>;
  delete(entity: JobPosting): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<JobPosting | null>;
  findAll(tenantId: Identifier): Promise<JobPosting[]>;
}
