import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { GetPermissionQuery } from './get-permission.query';
import * as domain from '@core/rbac/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { PermissionDto } from '../../dto/permission.dto';

@QueryHandler(GetPermissionQuery)
export class GetPermissionHandler implements IQueryHandler<GetPermissionQuery> {
  constructor(
    @Inject(domain.PERMISSION_REPOSITORY)
    private readonly repository: domain.PermissionRepository,
  ) {}

  async execute(query: GetPermissionQuery): Promise<Result<PermissionDto>> {
    const permission = await this.repository.findById(Identifier.create(query.id));

    if (!permission) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.RbacErrorCode.PERMISSION_NOT_FOUND,
        message: domain.RbacMessages.ERROR.PERMISSION_NOT_FOUND,
      });
    }

    return Result.success(PermissionMapper.toDto(permission), {
      statusCode: HttpStatus.OK,
    });
  }
}
