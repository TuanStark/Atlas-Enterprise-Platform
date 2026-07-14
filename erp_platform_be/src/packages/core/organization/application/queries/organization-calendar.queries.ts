import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ORGANIZATION_CALENDAR_REPOSITORY } from '@core/organization/domain/repositories/organization-calendar.repository';
import type { OrganizationCalendarRepository } from '@core/organization/domain/repositories/organization-calendar.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationCalendarResponseMapper } from '../mappers/organization-calendar.response.mapper';

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
    const domain = await this.repository.findById(
      Identifier.create(query.orgId),
      Identifier.create(query.id),
    );
    return domain ? OrganizationCalendarResponseMapper.toResponse(domain) : null;
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
    const list = await this.repository.findAll(Identifier.create(query.orgId));
    return list.map(OrganizationCalendarResponseMapper.toResponse);
  }
}
