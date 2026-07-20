import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemovePermissionFromRoleCommand } from './remove-permission-from-role.command';
import { HttpStatus, Inject } from '@nestjs/common';
import * as domain from '@core/rbac/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

@CommandHandler(RemovePermissionFromRoleCommand)
export class RemovePermissionFromRoleHandler implements ICommandHandler<RemovePermissionFromRoleCommand> {
  constructor(
    @Inject(domain.ROLE_REPOSITORY)
    private readonly roleRepository: domain.RoleRepository,
  ) {}

  async execute(command: RemovePermissionFromRoleCommand) {
    const role = await this.roleRepository.findById(Identifier.create(command.roleId));

    if (!role) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.RbacErrorCode.ROLE_NOT_FOUND,
        message: domain.RbacMessages.ERROR.ROLE_NOT_FOUND,
      });
    }

    role.removePermission(Identifier.create(command.permissionId));

    await this.roleRepository.update(role);

    return Result.success();
  }
}
