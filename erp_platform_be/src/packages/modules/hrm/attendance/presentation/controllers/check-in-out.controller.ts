import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CheckInDto, CheckOutDto } from '../../application/dto/check-in-out.dto';
import { CheckInCommand, CheckOutCommand } from '../../application/commands/check-in-out.commands';
import {
  GetAttendanceRecordQuery,
  ListAttendanceRecordsQuery,
  ListAttendanceRecordsByEmploymentQuery,
} from '../../application/queries/attendance-record.queries';

@ApiTags('Attendance Logging')
@Controller()
export class CheckInOutController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('attendance/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log a check-in event' })
  @ApiOkResponse({ type: String, description: 'ID of the created/updated attendance record' })
  checkIn(@CurrentContext() context: RequestContext, @Body() dto: CheckInDto) {
    return this.commandBus.execute(new CheckInCommand(Identifier.create(context.tenantId), dto));
  }

  @Post('attendance/records/:recordId/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log a check-out event' })
  @ApiOkResponse({ description: 'Check-out completed' })
  checkOut(
    @CurrentContext() context: RequestContext,
    @Param('recordId') recordId: string,
    @Body() dto: CheckOutDto,
  ) {
    return this.commandBus.execute(
      new CheckOutCommand(Identifier.create(context.tenantId), Identifier.create(recordId), dto),
    );
  }

  @Get('employments/:employmentId/attendance-records')
  @ApiOperation({ summary: 'List all attendance records for an employment' })
  @ApiOkResponse({ description: 'List of attendance records' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListAttendanceRecordsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }

  @Get('attendance/records')
  @ApiOperation({ summary: 'List all attendance records' })
  @ApiOkResponse({ description: 'List of all attendance records' })
  listAll(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListAttendanceRecordsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get('attendance/records/:id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiOkResponse({ description: 'Attendance record details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetAttendanceRecordQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
