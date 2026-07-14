import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { CreateRoleCommand } from './create-role.command';
import { RoleMapper } from '../../mappers/role.mapper';
import { ROLE_REPOSITORY, RoleCode, RbacErrorCode, RbacMessages } from '@core/rbac/domain';
import type { RoleRepository } from '@core/rbac/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: RoleRepository,
  ) {}

  async execute(command: CreateRoleCommand) {
    const tenantId = Identifier.create(command.dto.tenantId);
    const code = RoleCode.create(command.dto.code);

    const exists = await this.repository.existsByCode(tenantId, code);

    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: RbacErrorCode.ROLE_ALREADY_EXISTS,
        message: RbacMessages.ERROR.ROLE_ALREADY_EXISTS,
      });
    }

    const role = RoleMapper.toDomain(command.dto);

    await this.repository.save(role);

    return Result.success(undefined, {
      statusCode: HttpStatus.CREATED,
    });
  }
}
