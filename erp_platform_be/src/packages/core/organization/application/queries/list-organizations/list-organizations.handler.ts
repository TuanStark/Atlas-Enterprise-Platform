import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOrganizationsQuery } from './list-organizations.query';
import * as organizationRepository from '@core/organization/domain/repositories/organization.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@QueryHandler(ListOrganizationsQuery)
export class ListOrganizationsHandler implements IQueryHandler<ListOrganizationsQuery> {
  constructor(
    @Inject(organizationRepository.ORGANIZATION_REPOSITORY)
    private readonly repository: organizationRepository.OrganizationRepository,
  ) {}

  async execute(query: ListOrganizationsQuery) {
    return this.repository.findAll(Identifier.create(query.tenantId));
  }
}
