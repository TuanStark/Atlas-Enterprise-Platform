import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobRequisition } from '../aggregates/job-requisition.aggregate';

export const JOB_REQUISITION_REPOSITORY = Symbol('JOB_REQUISITION_REPOSITORY');

export interface JobRequisitionRepository {
  save(entity: JobRequisition): Promise<void>;
  update(entity: JobRequisition): Promise<void>;
  delete(entity: JobRequisition): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<JobRequisition | null>;
  findAll(tenantId: Identifier): Promise<JobRequisition[]>;
}
