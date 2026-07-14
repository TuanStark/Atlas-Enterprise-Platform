import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { GetPrincipalPermissionsQuery } from './get-principal-permissions.query';
import { PERMISSION_RESOLVER } from '@core/rbac/domain';
import type { PermissionResolver, ResolvedPermission } from '@core/rbac/domain';

@QueryHandler(GetPrincipalPermissionsQuery)
export class GetPrincipalPermissionsHandler implements IQueryHandler<GetPrincipalPermissionsQuery> {
  constructor(
    @Inject(PERMISSION_RESOLVER)
    private readonly resolver: PermissionResolver,
  ) {}

  async execute(query: GetPrincipalPermissionsQuery) {
    const principalId = Identifier.create(query.principalId);
    const permissions = await this.resolver.resolvePermissions(principalId);
    return Result.success(permissions);
  }
}
