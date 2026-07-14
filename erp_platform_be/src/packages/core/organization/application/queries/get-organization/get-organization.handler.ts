import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationQuery } from './get-organization.query';
import { ORGANIZATION_REPOSITORY } from '@core/organization/domain/repositories/organization.repository';
import type { OrganizationRepository } from '@core/organization/domain/repositories/organization.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationResponseMapper } from '../../mappers/organization.response.mapper';

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler implements IQueryHandler<GetOrganizationQuery> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly repository: OrganizationRepository,
  ) {}

  async execute(query: GetOrganizationQuery) {
    const domain = await this.repository.findById(
      Identifier.create(query.tenantId),
      Identifier.create(query.organizationId),
    );
    return domain ? OrganizationResponseMapper.toResponse(domain) : null;
  }
}
