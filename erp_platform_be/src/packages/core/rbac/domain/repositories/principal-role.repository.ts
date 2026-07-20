import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrincipalRole } from '../value-objects/principal-role';

export interface PrincipalRoleRepository {
  findByPrincipalId(principalId: Identifier): Promise<PrincipalRole[]>;
  findByRoleIds(roleIds: Identifier[]): Promise<PrincipalRole[]>;
  save(principalRole: PrincipalRole): Promise<void>;
  delete(principalId: Identifier, roleId: Identifier, scopeId: Identifier): Promise<void>;
  exists(principalId: Identifier, roleId: Identifier, scopeId: Identifier): Promise<boolean>;
}
