import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  InitializeLeaveBalanceDto,
  AdjustLeaveBalanceDto,
} from '../../application/dto/leave-balance.dto';
import {
  InitializeLeaveBalanceCommand,
  AdjustLeaveBalanceCommand,
} from '../../application/commands/leave-balance.commands';
import { ListLeaveBalancesByEmploymentQuery } from '../../application/queries/leave-balance.queries';

@ApiTags('Leave Balances')
@Controller()
export class LeaveBalanceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('leave-balances/initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize leave balances for employment based on policy' })
  @ApiOkResponse({ description: 'Leave balances initialized' })
  initialize(@CurrentContext() context: RequestContext, @Body() dto: InitializeLeaveBalanceDto) {
    return this.commandBus.execute(
      new InitializeLeaveBalanceCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get('employments/:employmentId/leave-balances')
  @ApiOperation({ summary: 'List leave balances for an employment' })
  @ApiOkResponse({ description: 'List of leave balances' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListLeaveBalancesByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }

  @Patch('leave-balances/:id/adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually adjust entitled days of a leave balance' })
  @ApiOkResponse({ description: 'Leave balance adjusted' })
  adjust(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: AdjustLeaveBalanceDto,
  ) {
    return this.commandBus.execute(
      new AdjustLeaveBalanceCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }
}
