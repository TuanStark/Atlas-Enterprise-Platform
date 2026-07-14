import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ORGANIZATION_CALENDAR_REPOSITORY } from '@core/organization/domain/repositories/organization-calendar.repository';
import type { OrganizationCalendarRepository } from '@core/organization/domain/repositories/organization-calendar.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

// Get
export class GetOrganizationCalendarQuery {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
  ) {}
}

@QueryHandler(GetOrganizationCalendarQuery)
export class GetOrganizationCalendarHandler implements IQueryHandler<GetOrganizationCalendarQuery> {
  constructor(
    @Inject(ORGANIZATION_CALENDAR_REPOSITORY)
    private readonly repository: OrganizationCalendarRepository,
  ) {}

  async execute(query: GetOrganizationCalendarQuery) {
    return this.repository.findById(Identifier.create(query.orgId), Identifier.create(query.id));
  }
}

// List
export class ListOrganizationCalendarsQuery {
  constructor(public readonly orgId: string) {}
}

@QueryHandler(ListOrganizationCalendarsQuery)
export class ListOrganizationCalendarsHandler implements IQueryHandler<ListOrganizationCalendarsQuery> {
  constructor(
    @Inject(ORGANIZATION_CALENDAR_REPOSITORY)
    private readonly repository: OrganizationCalendarRepository,
  ) {}

  async execute(query: ListOrganizationCalendarsQuery) {
    return this.repository.findAll(Identifier.create(query.orgId));
  }
}
