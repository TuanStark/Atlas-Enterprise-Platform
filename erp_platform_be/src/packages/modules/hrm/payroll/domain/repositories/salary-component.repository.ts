import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryComponent } from '../aggregates/salary-component.aggregate';

export const SALARY_COMPONENT_REPOSITORY = Symbol('SALARY_COMPONENT_REPOSITORY');

export interface SalaryComponentRepository {
  save(entity: SalaryComponent): Promise<void>;
  update(entity: SalaryComponent): Promise<void>;
  delete(entity: SalaryComponent): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<SalaryComponent | null>;
  findByCode(tenantId: Identifier, code: string): Promise<SalaryComponent | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<SalaryComponent[]>;
}
