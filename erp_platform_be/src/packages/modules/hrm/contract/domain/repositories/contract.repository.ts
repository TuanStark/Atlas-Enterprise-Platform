import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Contract } from '../aggregates/contract.aggregate';

export interface IContractRepository {
  findById(id: Identifier, tenantId: Identifier): Promise<Contract | null>;
  save(contract: Contract): Promise<void>;
}

export const IContractRepository = Symbol('IContractRepository');
