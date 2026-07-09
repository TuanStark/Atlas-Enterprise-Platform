import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { HttpStatus, Inject } from '@nestjs/common';

import { Result } from '@shared-kernel/application';

import { CreatePermissionCommand } from './create-permission.command';
import {
  PERMISSION_REPOSITORY,
  PermissionCode,
  RbacErrorCode,
  RbacMessages,
} from '@core/rbac/domain';
import type { PermissionRepository } from '@core/rbac/domain';
import { PermissionMapper } from '../../mappers/permission.mapper';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler implements ICommandHandler<CreatePermissionCommand> {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly repository: PermissionRepository,
  ) {}

  async execute(command: CreatePermissionCommand) {
    const code = PermissionCode.create(command.dto.code);

    const exists = await this.repository.existsByCode(code);

    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: RbacErrorCode.PERMISSION_ALREADY_EXISTS,
        message: RbacMessages.ERROR.PERMISSION_ALREADY_EXISTS,
      });
    }

    const permission = PermissionMapper.toDomain(command.dto);

    await this.repository.save(permission);

    return Result.success(undefined, {
      statusCode: HttpStatus.CREATED,
    });
  }
}
