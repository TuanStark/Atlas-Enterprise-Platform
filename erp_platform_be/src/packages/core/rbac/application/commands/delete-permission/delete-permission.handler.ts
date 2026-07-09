import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { DeletePermissionCommand } from './delete-permission.command';
import * as domain from '@core/rbac/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler implements ICommandHandler<DeletePermissionCommand> {
  constructor(
    @Inject(domain.PERMISSION_REPOSITORY)
    private readonly repository: domain.PermissionRepository,
  ) {}

  async execute(command: DeletePermissionCommand) {
    const permission = await this.repository.findById(Identifier.create(command.id));

    if (!permission) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.RbacErrorCode.PERMISSION_NOT_FOUND,
        message: domain.RbacMessages.ERROR.PERMISSION_NOT_FOUND,
      });
    }

    await this.repository.delete(permission);

    return Result.success(undefined, {
      statusCode: HttpStatus.NO_CONTENT,
    });
  }
}
