import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ContractType } from '../entities/contract-type.entity';

export const CONTRACT_TYPE_REPOSITORY = Symbol('CONTRACT_TYPE_REPOSITORY');

export interface ContractTypeRepository {
  save(entity: ContractType): Promise<void>;
  update(entity: ContractType): Promise<void>;
  delete(entity: ContractType): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<ContractType | null>;
  findByCode(tenantId: Identifier, code: string): Promise<ContractType | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<ContractType[]>;
}
