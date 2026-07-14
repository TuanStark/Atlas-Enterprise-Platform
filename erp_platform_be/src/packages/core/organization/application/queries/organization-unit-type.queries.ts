import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ORGANIZATION_UNIT_TYPE_REPOSITORY } from '@core/organization/domain/repositories/organization-unit-type.repository';
import type { OrganizationUnitTypeRepository } from '@core/organization/domain/repositories/organization-unit-type.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

// Get
export class GetOrganizationUnitTypeQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetOrganizationUnitTypeQuery)
export class GetOrganizationUnitTypeHandler implements IQueryHandler<GetOrganizationUnitTypeQuery> {
  constructor(
    @Inject(ORGANIZATION_UNIT_TYPE_REPOSITORY)
    private readonly repository: OrganizationUnitTypeRepository,
  ) {}

  async execute(query: GetOrganizationUnitTypeQuery) {
    return this.repository.findById(Identifier.create(query.id));
  }
}

// List
export class ListOrganizationUnitTypesQuery {}

@QueryHandler(ListOrganizationUnitTypesQuery)
export class ListOrganizationUnitTypesHandler implements IQueryHandler<ListOrganizationUnitTypesQuery> {
  constructor(
    @Inject(ORGANIZATION_UNIT_TYPE_REPOSITORY)
    private readonly repository: OrganizationUnitTypeRepository,
  ) {}

  async execute() {
    return this.repository.findAll();
  }
}
