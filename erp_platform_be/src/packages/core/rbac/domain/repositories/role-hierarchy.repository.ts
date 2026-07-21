import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const ROLE_HIERARCHY_REPOSITORY = 'ROLE_HIERARCHY_REPOSITORY';

export interface RoleHierarchyRepository {
  hasHierarchyRelation(parentRoleIds: Identifier[], childRoleIds: Identifier[]): Promise<boolean>;
  findDescendantRoleIds(parentRoleIds: Identifier[]): Promise<Identifier[]>;
}
