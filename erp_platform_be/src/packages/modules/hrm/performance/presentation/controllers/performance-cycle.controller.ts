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
import {
  CreatePerformanceCycleDto,
  UpdatePerformanceCycleDto,
} from '../../application/dto/performance-cycle.dto';
import {
  CreatePerformanceCycleCommand,
  UpdatePerformanceCycleCommand,
  DeletePerformanceCycleCommand,
} from '../../application/commands/performance-cycle.commands';
import {
  GetPerformanceCycleQuery,
  ListPerformanceCyclesQuery,
} from '../../application/queries/performance-cycle.queries';

@ApiTags('Performance Cycles')
@Controller('performance-cycles')
export class PerformanceCycleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a performance cycle' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created performance cycle' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreatePerformanceCycleDto) {
    return this.commandBus.execute(
      new CreatePerformanceCycleCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all performance cycles' })
  @ApiOkResponse({ description: 'List of performance cycles' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListPerformanceCyclesQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get performance cycle by ID' })
  @ApiOkResponse({ description: 'Performance cycle details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPerformanceCycleQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update performance cycle' })
  @ApiOkResponse({ description: 'Performance cycle updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdatePerformanceCycleDto,
  ) {
    return this.commandBus.execute(
      new UpdatePerformanceCycleCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete performance cycle' })
  @ApiOkResponse({ description: 'Performance cycle deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeletePerformanceCycleCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
