import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CALENDAR_REPOSITORY } from '../../domain/repositories/calendar.repository';
import type { CalendarRepository } from '../../domain/repositories/calendar.repository';
import { SystemCalendarDto } from '../dto/calendar.dto';

export class ListCalendarsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

@QueryHandler(ListCalendarsQuery)
export class ListCalendarsHandler implements IQueryHandler<ListCalendarsQuery> {
  constructor(
    @Inject(CALENDAR_REPOSITORY)
    private readonly repository: CalendarRepository,
  ) {}

  async execute(query: ListCalendarsQuery): Promise<SystemCalendarDto[]> {
    const calendars = await this.repository.listSystemCalendars(query.tenantId);
    return calendars.map((c) => ({
      id: c.id,
      code: c.code || undefined,
      name: c.name || '',
      timezone: c.timezone || 'UTC',
      workDays: c.workDays,
      holidays: (c.calendarHolidays || []).map((h: any) => ({
        id: h.id,
        holidayDate: h.holidayDate,
        name: h.name || '',
        recurring: h.recurring || false,
      })),
    }));
  }
}
