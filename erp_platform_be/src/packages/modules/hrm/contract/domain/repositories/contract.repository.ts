import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Contract } from '../aggregates/contract.aggregate';

export interface IContractRepository {
  findById(id: Identifier, tenantId: Identifier): Promise<Contract | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<Contract[]>;
  findAll(tenantId: Identifier, params: { page?: number; pageSize?: number; status?: string }): Promise<{ data: any[]; total: number }>;
  save(contract: Contract): Promise<void>;
}

export const IContractRepository = Symbol('IContractRepository');
