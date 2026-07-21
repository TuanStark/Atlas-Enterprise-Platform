import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ROLE_HIERARCHY_REPOSITORY } from '../../../domain';
import type { RoleHierarchyRepository } from '../../../domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class CheckRoleHierarchyQuery {
  constructor(
    public readonly parentRoleIds: string[],
    public readonly childRoleIds: string[],
  ) {}
}

@QueryHandler(CheckRoleHierarchyQuery)
export class CheckRoleHierarchyHandler implements IQueryHandler<CheckRoleHierarchyQuery> {
  constructor(
    @Inject(ROLE_HIERARCHY_REPOSITORY)
    private readonly roleHierarchyRepository: RoleHierarchyRepository,
  ) {}

  async execute(query: CheckRoleHierarchyQuery): Promise<boolean> {
    const parentIdentifiers = query.parentRoleIds.map((id) => Identifier.create(id));
    const childIdentifiers = query.childRoleIds.map((id) => Identifier.create(id));

    return this.roleHierarchyRepository.hasHierarchyRelation(parentIdentifiers, childIdentifiers);
  }
}
