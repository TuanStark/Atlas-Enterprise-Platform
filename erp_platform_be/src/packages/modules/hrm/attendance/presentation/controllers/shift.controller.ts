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
import { CreateShiftDto, UpdateShiftDto } from '../../application/dto/shift.dto';
import {
  CreateShiftCommand,
  UpdateShiftCommand,
  DeleteShiftCommand,
} from '../../application/commands/shift.commands';
import { GetShiftQuery, ListShiftsQuery } from '../../application/queries/shift.queries';

@ApiTags('Shifts')
@Controller('shifts')
export class ShiftController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a work shift' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created shift' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateShiftDto) {
    return this.commandBus.execute(
      new CreateShiftCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all shifts' })
  @ApiOkResponse({ description: 'List of shifts' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListShiftsQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiOkResponse({ description: 'Shift details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetShiftQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shift' })
  @ApiOkResponse({ description: 'Shift updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.commandBus.execute(
      new UpdateShiftCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shift' })
  @ApiOkResponse({ description: 'Shift deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteShiftCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
