import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const CALENDAR_REPOSITORY = 'CALENDAR_REPOSITORY';

export interface CalendarRepository {
  listSystemCalendars(tenantId: Identifier): Promise<any[]>;
  listHolidays(calendarId: Identifier): Promise<any[]>;
}
