import { Injectable, HttpStatus } from '@nestjs/common';
import { Result } from '@shared-kernel/application';
import { TenantErrorCode, TenantSuccessCode, TenantMessages } from '../../../domain';
import * as repositories from '../../../domain/repositories';
import { TenantCode } from '../../../domain/value-objects';
import { TenantMapper } from '../../mappers';

import { CreateTenantCommand } from './create-tenant.command';

@Injectable()
export class CreateTenantHandler {
  constructor(private readonly tenantRepository: repositories.TenantRepository) {}

  async execute(command: CreateTenantCommand): Promise<Result<void>> {
    const dto = command.dto;

    const code = TenantCode.create(dto.code);

    const exists = await this.tenantRepository.existsByCode(code);

    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: TenantErrorCode.CODE_ALREADY_EXISTS,
        message: TenantMessages.ERROR.CODE_ALREADY_EXISTS,
      });
    }

    const tenant = TenantMapper.toDomain(dto);

    await this.tenantRepository.save(tenant);

    return Result.success(undefined, {
      statusCode: HttpStatus.CREATED,
      code: TenantSuccessCode.CREATED,
      message: TenantMessages.SUCCESS.CREATED,
    });
  }
}
