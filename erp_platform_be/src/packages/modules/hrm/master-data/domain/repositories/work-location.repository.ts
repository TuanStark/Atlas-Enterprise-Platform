import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { WorkLocation } from '../entities/work-location.entity';

export const WORK_LOCATION_REPOSITORY = Symbol('WORK_LOCATION_REPOSITORY');

export interface WorkLocationRepository {
  save(entity: WorkLocation): Promise<void>;
  update(entity: WorkLocation): Promise<void>;
  delete(entity: WorkLocation): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<WorkLocation | null>;
  findByCode(tenantId: Identifier, code: string): Promise<WorkLocation | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<WorkLocation[]>;
}
