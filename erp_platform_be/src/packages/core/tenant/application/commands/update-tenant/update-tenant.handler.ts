import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as domain from '../../../domain';
import { TenantErrorCode, TenantSuccessCode, TenantMessages } from '../../../domain';
import { TenantMapper } from '../../mappers';
import { TenantDto } from '../../dto/tenant.dto';
import { UpdateTenantCommand } from './update-tenant.command';

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler implements ICommandHandler<UpdateTenantCommand> {
  constructor(
    @Inject(domain.TENANT_REPOSITORY)
    private readonly tenantRepository: domain.TenantRepository,
  ) {}

  async execute(command: UpdateTenantCommand): Promise<Result<TenantDto>> {
    const { id, dto } = command;
    console.log('UpdateTenantHandler input:', { id, dto });

    const tenant = await this.tenantRepository.findById(Identifier.create(id));

    if (!tenant) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: TenantErrorCode.NOT_FOUND,
        message: TenantMessages.ERROR.NOT_FOUND,
      });
    }

    TenantMapper.updateDomain(tenant, dto);

    await this.tenantRepository.save(tenant);

    return Result.success(TenantMapper.toDto(tenant), {
      statusCode: HttpStatus.OK,
      code: TenantSuccessCode.UPDATED,
      message: TenantMessages.SUCCESS.UPDATED,
    });
  }
}
