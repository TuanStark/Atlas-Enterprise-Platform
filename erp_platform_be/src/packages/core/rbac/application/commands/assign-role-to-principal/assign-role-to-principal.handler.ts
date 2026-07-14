import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject, Optional } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AssignRoleToPrincipalCommand } from './assign-role-to-principal.command';
import {
  ROLE_REPOSITORY,
  PRINCIPAL_ROLE_REPOSITORY,
  PERMISSION_CACHE,
  RbacErrorCode,
  RbacSuccessCode,
  RbacMessages,
  PrincipalRole,
} from '@core/rbac/domain';
import type { RoleRepository, PrincipalRoleRepository, PermissionCache } from '@core/rbac/domain';

@CommandHandler(AssignRoleToPrincipalCommand)
export class AssignRoleToPrincipalHandler implements ICommandHandler<AssignRoleToPrincipalCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PRINCIPAL_ROLE_REPOSITORY)
    private readonly principalRoleRepository: PrincipalRoleRepository,
    @Inject(PERMISSION_CACHE)
    @Optional()
    private readonly permissionCache: PermissionCache | null,
  ) {}

  async execute(command: AssignRoleToPrincipalCommand) {
    const principalId = Identifier.create(command.principalId);
    const roleId = Identifier.create(command.roleId);
    const scopeId = Identifier.create(command.scopeId);

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: RbacErrorCode.ROLE_NOT_FOUND,
        message: RbacMessages.ERROR.ROLE_NOT_FOUND,
      });
    }

    const alreadyAssigned = await this.principalRoleRepository.exists(principalId, roleId, scopeId);
    if (alreadyAssigned) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: RbacErrorCode.PRINCIPAL_ROLE_ALREADY_ASSIGNED,
        message: RbacMessages.ERROR.PRINCIPAL_ROLE_ALREADY_ASSIGNED,
      });
    }

    const principalRole = PrincipalRole.create(principalId, roleId, scopeId);
    await this.principalRoleRepository.save(principalRole);

    await this.permissionCache?.invalidate(command.principalId);

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
      code: RbacSuccessCode.PRINCIPAL_ROLE_ASSIGNED,
      message: RbacMessages.SUCCESS.PRINCIPAL_ROLE_ASSIGNED,
    });
  }
}
