import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobApplication } from '../aggregates/job-application.aggregate';

export const JOB_APPLICATION_REPOSITORY = Symbol('JOB_APPLICATION_REPOSITORY');

export interface JobApplicationRepository {
  save(entity: JobApplication): Promise<void>;
  update(entity: JobApplication): Promise<void>;
  delete(entity: JobApplication): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<JobApplication | null>;
  findAll(tenantId: Identifier): Promise<JobApplication[]>;
}
