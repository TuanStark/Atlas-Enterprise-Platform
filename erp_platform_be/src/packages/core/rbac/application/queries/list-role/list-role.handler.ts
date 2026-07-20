import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ListRoleQuery } from './list-role.query';
import { ROLE_REPOSITORY, PRINCIPAL_ROLE_REPOSITORY } from '@core/rbac/domain';
import type { RoleRepository, PrincipalRoleRepository } from '@core/rbac/domain';
import { RoleMapper } from '../../mappers/role.mapper';

@QueryHandler(ListRoleQuery)
export class ListRoleHandler implements IQueryHandler<ListRoleQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: RoleRepository,
    @Inject(PRINCIPAL_ROLE_REPOSITORY)
    private readonly principalRoleRepository: PrincipalRoleRepository,
  ) {}

  async execute(query: ListRoleQuery) {
    const tenantId = Identifier.create(query.tenantId);
    const roles = await this.repository.findByTenantId(tenantId);
    const dtos = roles.map((r) => RoleMapper.toDto(r));

    // Enrich with principalRoles count
    const roleIds = roles.map((r) => r.id);
    const principalRoles = await this.principalRoleRepository.findByRoleIds(roleIds);

    for (const dto of dtos) {
      dto.principalRoles = principalRoles
        .filter((pr) => pr.roleId.getValue() === dto.id)
        .map((pr) => ({
          principalId: pr.principalId.getValue(),
          roleId: pr.roleId.getValue(),
          scopeId: pr.scopeId.getValue(),
          assignedAt: pr.assignedAt?.toISOString(),
        }));
    }

    return Result.success(dtos);
  }
}
