import * as domain from '@core/tenant/domain';
import { HttpStatus, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import { TenantDto } from '../../dto/tenant.dto';
import { TenantMapper } from '../../mappers';
export class ListTenantsQuery {}

@QueryHandler(ListTenantsQuery)
export class ListTenantsHandler implements IQueryHandler<ListTenantsQuery> {
  constructor(
    @Inject(domain.TENANT_REPOSITORY)
    private readonly tenantRepository: domain.TenantRepository,
  ) {}

  async execute(): Promise<Result<TenantDto[]>> {
    const tenants = await this.tenantRepository.findAll();

    return Result.success(
      tenants.map((tenant) => TenantMapper.toDto(tenant)),
      {
        statusCode: HttpStatus.OK,
      },
    );
  }
}
