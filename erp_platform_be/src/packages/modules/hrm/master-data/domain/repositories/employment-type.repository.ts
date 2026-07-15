import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmploymentType } from '../entities/employment-type.entity';

export const EMPLOYMENT_TYPE_REPOSITORY = Symbol('EMPLOYMENT_TYPE_REPOSITORY');

export interface EmploymentTypeRepository {
  save(entity: EmploymentType): Promise<void>;
  update(entity: EmploymentType): Promise<void>;
  delete(entity: EmploymentType): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<EmploymentType | null>;
  findByCode(tenantId: Identifier, code: string): Promise<EmploymentType | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<EmploymentType[]>;
}
