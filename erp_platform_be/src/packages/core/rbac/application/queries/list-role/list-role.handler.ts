import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ListRoleQuery } from './list-role.query';
import { ROLE_REPOSITORY } from '@core/rbac/domain';
import type { RoleRepository } from '@core/rbac/domain';
import { RoleMapper } from '../../mappers/role.mapper';

@QueryHandler(ListRoleQuery)
export class ListRoleHandler implements IQueryHandler<ListRoleQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: RoleRepository,
  ) { }

  async execute(query: ListRoleQuery) {
    const tenantId = Identifier.create(query.tenantId);
    const roles = await this.repository.findByTenantId(tenantId);
    return Result.success(roles.map((r) => RoleMapper.toDto(r)));
  }
}
