import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { HttpStatus, Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { UpdatePermissionCommand } from './update-permission.command';
import * as domain from '@core/rbac/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermissionCommand> {
  constructor(
    @Inject(domain.PERMISSION_REPOSITORY)
    private readonly repository: domain.PermissionRepository,
  ) {}

  async execute(command: UpdatePermissionCommand) {
    const permission = await this.repository.findById(Identifier.create(command.id));

    if (!permission) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.RbacErrorCode.PERMISSION_NOT_FOUND,
        message: domain.RbacMessages.ERROR.PERMISSION_NOT_FOUND,
      });
    }

    if (command.dto.name) {
      permission.rename(command.dto.name);
    }

    if (command.dto.description !== undefined) {
      permission.changeDescription(command.dto.description);
    }

    await this.repository.update(permission);

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}
