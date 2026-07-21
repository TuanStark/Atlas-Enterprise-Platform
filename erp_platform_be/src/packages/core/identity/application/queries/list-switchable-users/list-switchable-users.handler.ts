import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { USER_REPOSITORY } from '@core/identity/domain';
import type { UserRepository } from '@core/identity/domain';
import {
  ListPrincipalRolesQuery,
  PrincipalRoleDto,
  GetRoleQuery,
  RoleDto,
  GetDescendantRoleIdsQuery,
} from '@core/rbac/application';
import { Result } from '@shared-kernel/application';

export class ListSwitchableUsersQuery {
  constructor(
    public readonly currentPrincipalId: string,
    public readonly tenantId: string,
  ) {}
}

export interface SwitchableUserDto {
  principalId: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  roles: string[];
}

@QueryHandler(ListSwitchableUsersQuery)
export class ListSwitchableUsersHandler implements IQueryHandler<ListSwitchableUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ListSwitchableUsersQuery): Promise<SwitchableUserDto[]> {
    const { currentPrincipalId, tenantId } = query;

    const currentRolesResult = await this.queryBus.execute<
      ListPrincipalRolesQuery,
      Result<PrincipalRoleDto[]>
    >(new ListPrincipalRolesQuery(currentPrincipalId));

    if (!currentRolesResult.isSuccess() || !currentRolesResult.data.length) {
      return [];
    }

    const currentRoleIds = currentRolesResult.data.map((pr) => pr.roleId);

    const descendantRoleIds = await this.queryBus.execute<GetDescendantRoleIdsQuery, string[]>(
      new GetDescendantRoleIdsQuery(currentRoleIds),
    );

    if (!descendantRoleIds.length) {
      return [];
    }

    const tenantUsers = await this.userRepository.findByTenant(Identifier.create(tenantId));

    if (!tenantUsers.length) {
      return [];
    }

    const result: SwitchableUserDto[] = [];

    for (const user of tenantUsers) {
      if (user.principalId.getValue() === currentPrincipalId) {
        continue;
      }

      const userRolesResult = await this.queryBus.execute<
        ListPrincipalRolesQuery,
        Result<PrincipalRoleDto[]>
      >(new ListPrincipalRolesQuery(user.principalId.getValue()));

      if (!userRolesResult.isSuccess()) {
        continue;
      }

      const userRoleIds = userRolesResult.data.map((pr) => pr.roleId);
      const isSwitchable = userRoleIds.some((roleId) => descendantRoleIds.includes(roleId));

      if (!isSwitchable) {
        continue;
      }

      const roleCodes: string[] = [];
      for (const pr of userRolesResult.data) {
        const roleResult = await this.queryBus.execute<GetRoleQuery, Result<RoleDto>>(
          new GetRoleQuery(pr.roleId),
        );
        if (roleResult.isSuccess() && roleResult.data.code) {
          roleCodes.push(roleResult.data.code);
        }
      }

      result.push({
        principalId: user.principalId.getValue(),
        username: user.email.value,
        email: user.email.value,
        displayName:
          user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.email.value,
        avatarUrl: user.avatarUrl || null,
        roles: roleCodes,
      });
    }

    return result;
  }
}
