import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AssignShiftDto } from '../../application/dto/shift-assignment.dto';
import { AssignShiftCommand } from '../../application/commands/shift-assignment.commands';
import { ListShiftAssignmentsByEmploymentQuery } from '../../application/queries/shift-assignment.queries';

@ApiTags('Shift Assignments')
@Controller()
export class ShiftAssignmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('employments/:employmentId/shift-assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a shift to an employment' })
  @ApiCreatedResponse({ type: String, description: 'ID of the shift assignment' })
  assign(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
    @Body() dto: AssignShiftDto,
  ) {
    return this.commandBus.execute(
      new AssignShiftCommand(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
        dto,
      ),
    );
  }

  @Get('employments/:employmentId/shift-assignments')
  @ApiOperation({ summary: 'List all shift assignments for an employment' })
  @ApiOkResponse({ description: 'List of shift assignments' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListShiftAssignmentsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }
}
