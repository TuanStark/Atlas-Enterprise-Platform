import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from '../../application/dto/leave-type.dto';
import {
  CreateLeaveTypeCommand,
  UpdateLeaveTypeCommand,
  DeleteLeaveTypeCommand,
} from '../../application/commands/leave-type.commands';
import {
  GetLeaveTypeQuery,
  ListLeaveTypesQuery,
} from '../../application/queries/leave-type.queries';

@ApiTags('Leave Types')
@Controller('leave-types')
export class LeaveTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a leave type' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created leave type' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateLeaveTypeDto) {
    return this.commandBus.execute(
      new CreateLeaveTypeCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all leave types' })
  @ApiOkResponse({ description: 'List of leave types' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListLeaveTypesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave type by ID' })
  @ApiOkResponse({ description: 'Leave type details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetLeaveTypeQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update leave type' })
  @ApiOkResponse({ description: 'Leave type updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return this.commandBus.execute(
      new UpdateLeaveTypeCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete leave type' })
  @ApiOkResponse({ description: 'Leave type deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteLeaveTypeCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
