import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ListPrincipalRolesQuery } from './list-principal-roles.query';
import { PRINCIPAL_ROLE_REPOSITORY } from '@core/rbac/domain';
import type { PrincipalRoleRepository } from '@core/rbac/domain';
import { PrincipalRoleDto } from '../../dto/principal-role.dto';

@QueryHandler(ListPrincipalRolesQuery)
export class ListPrincipalRolesHandler implements IQueryHandler<ListPrincipalRolesQuery> {
  constructor(
    @Inject(PRINCIPAL_ROLE_REPOSITORY)
    private readonly repository: PrincipalRoleRepository,
  ) { }

  async execute(query: ListPrincipalRolesQuery) {
    const principalId = Identifier.create(query.principalId);
    const principalRoles = await this.repository.findByPrincipalId(principalId);

    const dtos: PrincipalRoleDto[] = principalRoles.map((pr) => ({
      principalId: pr.principalId.getValue(),
      roleId: pr.roleId.getValue(),
      scopeId: pr.scopeId.getValue(),
      assignedAt: pr.assignedAt,
    }));

    return Result.success(dtos);
  }
}
