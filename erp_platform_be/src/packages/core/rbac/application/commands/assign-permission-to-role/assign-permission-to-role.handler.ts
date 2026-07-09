import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignPermissionToRoleCommand } from './assign-permission-to-role.command';
import { HttpStatus, Inject } from '@nestjs/common';
import * as domain from '@core/rbac/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

@CommandHandler(AssignPermissionToRoleCommand)
export class AssignPermissionToRoleHandler implements ICommandHandler<AssignPermissionToRoleCommand> {
  constructor(
    @Inject(domain.ROLE_REPOSITORY)
    private readonly roleRepository: domain.RoleRepository,
    @Inject(domain.PERMISSION_REPOSITORY)
    private readonly permissionRepository: domain.PermissionRepository,
  ) {}

  async execute(command: AssignPermissionToRoleCommand) {
    const role = await this.roleRepository.findById(Identifier.create(command.roleId));

    if (!role) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.RbacErrorCode.ROLE_NOT_FOUND,
        message: domain.RbacMessages.ERROR.ROLE_NOT_FOUND,
      });
    }

    const permission = await this.permissionRepository.findById(
      Identifier.create(command.permissionId),
    );

    if (!permission) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.RbacErrorCode.PERMISSION_NOT_FOUND,
        message: domain.RbacMessages.ERROR.PERMISSION_NOT_FOUND,
      });
    }

    role.assignPermission(permission.id);

    await this.roleRepository.update(role);

    return Result.success();
  }
}
