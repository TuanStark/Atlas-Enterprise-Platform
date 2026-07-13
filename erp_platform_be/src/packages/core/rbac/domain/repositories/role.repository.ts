import { Role } from '../entities/role';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RoleCode } from '../value-objects/role-code';

export interface RoleRepository {
  save(role: Role): Promise<void>;
  update(role: Role): Promise<void>;
  delete(role: Role): Promise<void>;
  findById(id: Identifier): Promise<Role | null>;
  findByCode(code: RoleCode): Promise<Role | null>;
  existsByCode(tenantId: Identifier, code: RoleCode): Promise<boolean>;
  findAll(): Promise<Role[]>;
}
