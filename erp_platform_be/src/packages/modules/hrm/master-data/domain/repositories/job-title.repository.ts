import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobTitle } from '../entities/job-title.entity';

export const JOB_TITLE_REPOSITORY = Symbol('JOB_TITLE_REPOSITORY');

export interface JobTitleRepository {
  save(entity: JobTitle): Promise<void>;
  update(entity: JobTitle): Promise<void>;
  delete(entity: JobTitle): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<JobTitle | null>;
  findByCode(tenantId: Identifier, code: string): Promise<JobTitle | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<JobTitle[]>;
}
