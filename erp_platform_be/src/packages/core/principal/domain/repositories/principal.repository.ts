import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Principal } from '../entities/principal';
import { PrincipalStatus } from '../enums/principal-status';

export interface PrincipalRepository {
  save(principal: Principal): Promise<void>;
  update(principal: Principal): Promise<void>;
  delete(principal: Principal): Promise<void>;
  findById(id: Identifier): Promise<Principal | null>;
  findAll(): Promise<Principal[]>;
  exists(id: Identifier): Promise<boolean>;
  findByTenant(tenantId: Identifier): Promise<Principal[]>;
  findByStatus(status: PrincipalStatus): Promise<Principal[]>;
  findByIds(ids: Identifier[]): Promise<Principal[]>;
}
