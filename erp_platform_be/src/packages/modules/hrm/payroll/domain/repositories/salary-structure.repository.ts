import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryStructure } from '../aggregates/salary-structure.aggregate';

export const SALARY_STRUCTURE_REPOSITORY = Symbol('SALARY_STRUCTURE_REPOSITORY');

export interface SalaryStructureRepository {
  save(entity: SalaryStructure): Promise<void>;
  update(entity: SalaryStructure): Promise<void>;
  delete(entity: SalaryStructure): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<SalaryStructure | null>;
  findByCode(tenantId: Identifier, code: string): Promise<SalaryStructure | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<SalaryStructure[]>;
}
