import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SystemCalendarDto } from '../../application/dto/calendar.dto';
import { ListCalendarsQuery } from '../../application/queries/calendar.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Calendars & Holidays')
@Controller('calendars')
export class CalendarController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermission('shared.calendar:read')
  @ApiOperation({ summary: 'List all system calendars with holidays' })
  @ApiOkResponse({ type: [SystemCalendarDto] })
  async list(@CurrentContext() context: RequestContext): Promise<SystemCalendarDto[]> {
    return this.queryBus.execute(new ListCalendarsQuery(Identifier.create(context.tenantId)));
  }
}
