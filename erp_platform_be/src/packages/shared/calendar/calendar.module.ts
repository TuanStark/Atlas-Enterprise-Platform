import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { CalendarController } from './presentation/controllers/calendar.controller';
import { ListCalendarsHandler } from './application/queries/calendar.queries';
import { CALENDAR_REPOSITORY } from './domain/repositories/calendar.repository';
import { PrismaCalendarRepository } from './infrastructure/persistence/prisma-calendar.repository';

const QueryHandlers = [ListCalendarsHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [CalendarController],
  providers: [
    ...QueryHandlers,
    {
      provide: CALENDAR_REPOSITORY,
      useClass: PrismaCalendarRepository,
    },
  ],
  exports: [CALENDAR_REPOSITORY],
})
export class CalendarModule {}
