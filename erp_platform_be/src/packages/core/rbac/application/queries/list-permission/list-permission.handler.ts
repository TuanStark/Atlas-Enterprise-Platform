import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as domain from '@core/rbac/domain';
import { ListPermissionQuery } from './list-permission.query';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { Result } from '@shared-kernel/application';
import { PERMISSION_REPOSITORY } from '@core/rbac/domain';

@QueryHandler(ListPermissionQuery)
export class ListPermissionHandler implements IQueryHandler<ListPermissionQuery> {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly repository: domain.PermissionRepository,
  ) {}

  async execute() {
    const permissions = await this.repository.findAll();

    return Result.success(permissions.map((p) => PermissionMapper.toDto(p)));
  }
}
