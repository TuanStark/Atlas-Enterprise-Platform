import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { HttpStatus, Inject } from '@nestjs/common';

import { Result } from '@shared-kernel/application';

import { GetRoleQuery } from './get-role.query';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RoleMapper } from '../../mappers/role.mapper';
import { ROLE_REPOSITORY, RbacErrorCode, RbacMessages } from '@core/rbac/domain';
import type { RoleRepository } from '@core/rbac/domain';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: RoleRepository,
  ) {}

  async execute(query: GetRoleQuery) {
    const role = await this.repository.findById(Identifier.create(query.id));

    if (!role) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: RbacErrorCode.ROLE_NOT_FOUND,
        message: RbacMessages.ERROR.ROLE_NOT_FOUND,
      });
    }

    return Result.success(RoleMapper.toDto(role));
  }
}
