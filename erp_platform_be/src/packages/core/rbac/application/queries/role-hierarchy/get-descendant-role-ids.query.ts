import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ROLE_HIERARCHY_REPOSITORY } from '../../../domain';
import type { RoleHierarchyRepository } from '../../../domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class GetDescendantRoleIdsQuery {
  constructor(public readonly parentRoleIds: string[]) {}
}

@QueryHandler(GetDescendantRoleIdsQuery)
export class GetDescendantRoleIdsHandler implements IQueryHandler<GetDescendantRoleIdsQuery> {
  constructor(
    @Inject(ROLE_HIERARCHY_REPOSITORY)
    private readonly roleHierarchyRepository: RoleHierarchyRepository,
  ) {}

  async execute(query: GetDescendantRoleIdsQuery): Promise<string[]> {
    const parentIdentifiers = query.parentRoleIds.map((id) => Identifier.create(id));
    const descendantIdentifiers =
      await this.roleHierarchyRepository.findDescendantRoleIds(parentIdentifiers);

    return descendantIdentifiers.map((id) => id.getValue());
  }
}
