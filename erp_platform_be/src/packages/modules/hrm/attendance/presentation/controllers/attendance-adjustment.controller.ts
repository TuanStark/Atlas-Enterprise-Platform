import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RequestAdjustmentDto } from '../../application/dto/attendance-adjustment.dto';
import {
  RequestAdjustmentCommand,
  ApproveAdjustmentCommand,
  RejectAdjustmentCommand,
} from '../../application/commands/attendance-adjustment.commands';

@ApiTags('Attendance Adjustments')
@Controller()
export class AttendanceAdjustmentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('attendance/records/:recordId/adjustments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an attendance adjustment request' })
  @ApiOkResponse({ type: String, description: 'ID of the created adjustment request' })
  requestAdjustment(
    @CurrentContext() context: RequestContext,
    @Param('recordId') recordId: string,
    @Body() dto: RequestAdjustmentDto,
  ) {
    return this.commandBus.execute(
      new RequestAdjustmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(recordId),
        context.principalId,
        dto,
      ),
    );
  }

  @Patch('attendance/records/:recordId/adjustments/:adjustmentId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an attendance adjustment request' })
  @ApiOkResponse({ description: 'Adjustment request approved and times applied' })
  approve(
    @CurrentContext() context: RequestContext,
    @Param('recordId') recordId: string,
    @Param('adjustmentId') adjustmentId: string,
  ) {
    return this.commandBus.execute(
      new ApproveAdjustmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(recordId),
        Identifier.create(adjustmentId),
        context.principalId,
      ),
    );
  }

  @Patch('attendance/records/:recordId/adjustments/:adjustmentId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an attendance adjustment request' })
  @ApiOkResponse({ description: 'Adjustment request rejected' })
  reject(
    @CurrentContext() context: RequestContext,
    @Param('recordId') recordId: string,
    @Param('adjustmentId') adjustmentId: string,
  ) {
    return this.commandBus.execute(
      new RejectAdjustmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(recordId),
        Identifier.create(adjustmentId),
        context.principalId,
      ),
    );
  }
}
