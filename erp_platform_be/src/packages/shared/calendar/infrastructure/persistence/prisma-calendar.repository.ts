import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CalendarRepository } from '../../domain/repositories/calendar.repository';

@Injectable()
export class PrismaCalendarRepository implements CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listSystemCalendars(tenantId: Identifier): Promise<any[]> {
    return this.prisma.systemCalendar.findMany({
      where: {
        OR: [
          { tenantId: tenantId.getValue() },
          { tenantId: null },
        ],
      },
      include: {
        calendarHolidays: true,
      },
    });
  }

  async listHolidays(calendarId: Identifier): Promise<any[]> {
    return this.prisma.holiday.findMany({
      where: { calendarId: calendarId.getValue() },
      orderBy: { holidayDate: 'asc' },
    });
  }
}
