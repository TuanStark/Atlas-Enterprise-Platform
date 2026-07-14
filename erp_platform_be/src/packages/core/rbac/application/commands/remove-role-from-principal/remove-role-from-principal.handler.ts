import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject, Optional } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RemoveRoleFromPrincipalCommand } from './remove-role-from-principal.command';
import {
  PRINCIPAL_ROLE_REPOSITORY,
  PERMISSION_CACHE,
  RbacErrorCode,
  RbacMessages,
} from '@core/rbac/domain';
import type { PrincipalRoleRepository, PermissionCache } from '@core/rbac/domain';

@CommandHandler(RemoveRoleFromPrincipalCommand)
export class RemoveRoleFromPrincipalHandler implements ICommandHandler<RemoveRoleFromPrincipalCommand> {
  constructor(
    @Inject(PRINCIPAL_ROLE_REPOSITORY)
    private readonly principalRoleRepository: PrincipalRoleRepository,
    @Inject(PERMISSION_CACHE)
    @Optional()
    private readonly permissionCache: PermissionCache | null,
  ) {}

  async execute(command: RemoveRoleFromPrincipalCommand) {
    const principalId = Identifier.create(command.principalId);
    const roleId = Identifier.create(command.roleId);
    const scopeId = Identifier.create(command.scopeId);

    const exists = await this.principalRoleRepository.exists(principalId, roleId, scopeId);
    if (!exists) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: RbacErrorCode.PRINCIPAL_ROLE_NOT_FOUND,
        message: RbacMessages.ERROR.PRINCIPAL_ROLE_NOT_FOUND,
      });
    }

    await this.principalRoleRepository.delete(principalId, roleId, scopeId);

    await this.permissionCache?.invalidate(command.principalId);

    return Result.success();
  }
}
