import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateLeaveRequestDto } from '../../application/dto/leave-request.dto';
import {
  CreateLeaveRequestCommand,
  ApproveLeaveRequestCommand,
  RejectLeaveRequestCommand,
} from '../../application/commands/leave-request.commands';
import {
  GetLeaveRequestQuery,
  ListLeaveRequestsQuery,
  ListLeaveRequestsByEmploymentQuery,
} from '../../application/queries/leave-request.queries';

@ApiTags('Leave Requests')
@Controller()
export class LeaveRequestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('leave-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a leave request' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created leave request' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateLeaveRequestDto) {
    return this.commandBus.execute(
      new CreateLeaveRequestCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get('leave-requests')
  @ApiOperation({ summary: 'List all leave requests' })
  @ApiOkResponse({ description: 'List of all leave requests' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListLeaveRequestsQuery(Identifier.create(context.tenantId)));
  }

  @Get('employments/:employmentId/leave-requests')
  @ApiOperation({ summary: 'List leave requests for an employment' })
  @ApiOkResponse({ description: 'List of leave requests' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListLeaveRequestsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }

  @Get('leave-requests/:id')
  @ApiOperation({ summary: 'Get leave request details by ID' })
  @ApiOkResponse({ description: 'Leave request details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetLeaveRequestQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch('leave-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiOkResponse({ description: 'Leave request approved and balance deducted' })
  approve(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new ApproveLeaveRequestCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        context.principalId,
      ),
    );
  }

  @Patch('leave-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiOkResponse({ description: 'Leave request rejected' })
  reject(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new RejectLeaveRequestCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        context.principalId,
      ),
    );
  }
}
