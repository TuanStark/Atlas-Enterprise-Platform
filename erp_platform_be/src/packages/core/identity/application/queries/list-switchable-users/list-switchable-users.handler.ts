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
    public readonly search?: string,
    public readonly limit: number = 10,
    public readonly offset: number = 0,
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

export interface PaginatedSwitchableUsersDto {
  items: SwitchableUserDto[];
  total: number;
  hasMore: boolean;
}

@QueryHandler(ListSwitchableUsersQuery)
export class ListSwitchableUsersHandler implements IQueryHandler<ListSwitchableUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ListSwitchableUsersQuery): Promise<PaginatedSwitchableUsersDto> {
    const { currentPrincipalId, tenantId, search, limit = 10, offset = 0 } = query;

    const currentRolesResult = await this.queryBus.execute<
      ListPrincipalRolesQuery,
      Result<PrincipalRoleDto[]>
    >(new ListPrincipalRolesQuery(currentPrincipalId));

    if (!currentRolesResult.isSuccess() || !currentRolesResult.data.length) {
      return { items: [], total: 0, hasMore: false };
    }

    const currentRoleIds = currentRolesResult.data.map((pr) => pr.roleId);

    const descendantRoleIds = await this.queryBus.execute<GetDescendantRoleIdsQuery, string[]>(
      new GetDescendantRoleIdsQuery(currentRoleIds),
    );

    if (!descendantRoleIds.length) {
      return { items: [], total: 0, hasMore: false };
    }

    const tenantUsers = await this.userRepository.findByTenant(Identifier.create(tenantId));

    if (!tenantUsers.length) {
      return { items: [], total: 0, hasMore: false };
    }

    const matchedUsers: SwitchableUserDto[] = [];
    const searchKeyword = search ? search.toLowerCase().trim() : '';

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

      const displayName =
        user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.email.value;
      const email = user.email.value;

      if (searchKeyword) {
        const matchesName = displayName.toLowerCase().includes(searchKeyword);
        const matchesEmail = email.toLowerCase().includes(searchKeyword);
        const matchesRole = roleCodes.some((rc) => rc.toLowerCase().includes(searchKeyword));

        if (!matchesName && !matchesEmail && !matchesRole) {
          continue;
        }
      }

      matchedUsers.push({
        principalId: user.principalId.getValue(),
        username: user.email.value,
        email,
        displayName,
        avatarUrl: user.avatarUrl || null,
        roles: roleCodes,
      });
    }

    const total = matchedUsers.length;
    const items = matchedUsers.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      items,
      total,
      hasMore,
    };
  }
}
