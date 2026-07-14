import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationQuery } from './get-organization.query';
import * as organizationRepository from '@core/organization/domain/repositories/organization.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler implements IQueryHandler<GetOrganizationQuery> {
  constructor(
    @Inject(organizationRepository.ORGANIZATION_REPOSITORY)
    private readonly repository: organizationRepository.OrganizationRepository,
  ) {}

  async execute(query: GetOrganizationQuery) {
    return this.repository.findById(
      Identifier.create(query.tenantId),
      Identifier.create(query.organizationId),
    );
  }
}
