import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOrganizationsQuery } from './list-organizations.query';
import { ORGANIZATION_REPOSITORY } from '@core/organization/domain/repositories/organization.repository';
import type { OrganizationRepository } from '@core/organization/domain/repositories/organization.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationResponseMapper } from '../../mappers/organization.response.mapper';

@QueryHandler(ListOrganizationsQuery)
export class ListOrganizationsHandler implements IQueryHandler<ListOrganizationsQuery> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly repository: OrganizationRepository,
  ) {}

  async execute(query: ListOrganizationsQuery) {
    const list = await this.repository.findAll(Identifier.create(query.tenantId));
    return list.map(OrganizationResponseMapper.toResponse);
  }
}
