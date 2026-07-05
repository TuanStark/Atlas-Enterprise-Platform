import { HttpStatus, Inject } from '@nestjs/common';

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';
import { GetTenantQuery } from './get-tenant.query';
import * as domain from '@core/tenant/domain';
import { TenantErrorCode, TenantMessages } from '@core/tenant/domain';
import { TenantMapper } from '../../mappers';
import { TenantDto } from '../../dto/tenant.dto';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@QueryHandler(GetTenantQuery)
export class GetTenantHandler implements IQueryHandler<GetTenantQuery> {
  constructor(
    @Inject(domain.TENANT_REPOSITORY)
    private readonly tenantRepository: domain.TenantRepository,
  ) {}

  async execute(query: GetTenantQuery): Promise<Result<TenantDto>> {
    const tenant = await this.tenantRepository.findById(Identifier.create(query.id));

    if (!tenant) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: TenantErrorCode.NOT_FOUND,
        message: TenantMessages.ERROR.NOT_FOUND,
      });
    }

    return Result.success(TenantMapper.toDto(tenant), {
      statusCode: HttpStatus.OK,
    });
  }
}
