import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employment } from '../aggregates/employment.aggregate';

export const EMPLOYMENT_REPOSITORY = Symbol('EMPLOYMENT_REPOSITORY');

export interface EmploymentRepository {
  save(entity: Employment): Promise<void>;
  update(entity: Employment): Promise<void>;
  delete(entity: Employment): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<Employment | null>;
  findByEmployeeId(tenantId: Identifier, employeeId: Identifier): Promise<Employment[]>;
  findByEmployeeCode(tenantId: Identifier, employeeCode: string): Promise<Employment | null>;
  existsByEmployeeCode(tenantId: Identifier, employeeCode: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<Employment[]>;
}
