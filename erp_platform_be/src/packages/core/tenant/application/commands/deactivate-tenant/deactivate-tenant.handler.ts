import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as domain from '../../../domain';
import { TenantErrorCode, TenantSuccessCode, TenantMessages } from '../../../domain';

import { DeactivateTenantCommand } from './deactivate-tenant.command';

@CommandHandler(DeactivateTenantCommand)
export class DeactivateTenantHandler implements ICommandHandler<DeactivateTenantCommand> {
  constructor(
    @Inject(domain.TENANT_REPOSITORY)
    private readonly tenantRepository: domain.TenantRepository,
  ) {}

  async execute(command: DeactivateTenantCommand): Promise<Result<void>> {
    const { id } = command;

    const tenant = await this.tenantRepository.findById(Identifier.create(id));

    if (!tenant) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: TenantErrorCode.NOT_FOUND,
        message: TenantMessages.ERROR.NOT_FOUND,
      });
    }

    tenant.deactivate();

    await this.tenantRepository.save(tenant);

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
      code: TenantSuccessCode.DEACTIVATED,
      message: TenantMessages.SUCCESS.DEACTIVATED,
    });
  }
}
