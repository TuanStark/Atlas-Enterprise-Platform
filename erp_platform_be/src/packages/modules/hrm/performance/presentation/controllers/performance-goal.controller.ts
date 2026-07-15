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
  CreatePerformanceGoalDto,
  UpdatePerformanceGoalDto,
  UpdateGoalProgressDto,
} from '../../application/dto/performance-goal.dto';
import {
  CreatePerformanceGoalCommand,
  UpdatePerformanceGoalCommand,
  DeletePerformanceGoalCommand,
  UpdateGoalProgressCommand,
} from '../../application/commands/performance-goal.commands';
import {
  GetPerformanceGoalQuery,
  ListPerformanceGoalsQuery,
  ListGoalsByEmploymentQuery,
} from '../../application/queries/performance-goal.queries';

@ApiTags('Performance Goals')
@Controller('performance-goals')
export class PerformanceGoalController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a performance goal' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created performance goal' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreatePerformanceGoalDto) {
    return this.commandBus.execute(
      new CreatePerformanceGoalCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all performance goals' })
  @ApiOkResponse({ description: 'List of performance goals' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListPerformanceGoalsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get('employment/:employmentId')
  @ApiOperation({ summary: 'List goals by employment ID' })
  @ApiOkResponse({ description: 'List of goals for an employment' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListGoalsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get performance goal by ID' })
  @ApiOkResponse({ description: 'Performance goal details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPerformanceGoalQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update performance goal' })
  @ApiOkResponse({ description: 'Performance goal updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdatePerformanceGoalDto,
  ) {
    return this.commandBus.execute(
      new UpdatePerformanceGoalCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete performance goal' })
  @ApiOkResponse({ description: 'Performance goal deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeletePerformanceGoalCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Post(':id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update goal progress' })
  @ApiOkResponse({ description: 'Goal progress updated' })
  updateProgress(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ) {
    return this.commandBus.execute(
      new UpdateGoalProgressCommand(Identifier.create(context.tenantId), Identifier.create(id), {
        ...dto,
        updatedByPrincipalId: context.principalId,
      }),
    );
  }
}
