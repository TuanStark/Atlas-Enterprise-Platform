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
  CreateTrainingSessionDto,
  UpdateTrainingSessionDto,
} from '../../application/dto/training-session.dto';
import {
  CreateTrainingSessionCommand,
  UpdateTrainingSessionCommand,
  DeleteTrainingSessionCommand,
} from '../../application/commands/training-session.commands';
import {
  GetTrainingSessionQuery,
  ListTrainingSessionsQuery,
} from '../../application/queries/training-session.queries';

@ApiTags('Training Sessions')
@Controller('training-sessions')
export class TrainingSessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a training session' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created training session' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateTrainingSessionDto) {
    return this.commandBus.execute(
      new CreateTrainingSessionCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all training sessions' })
  @ApiOkResponse({ description: 'List of training sessions' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListTrainingSessionsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training session by ID' })
  @ApiOkResponse({ description: 'Training session details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetTrainingSessionQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update training session' })
  @ApiOkResponse({ description: 'Training session updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingSessionDto,
  ) {
    return this.commandBus.execute(
      new UpdateTrainingSessionCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete training session' })
  @ApiOkResponse({ description: 'Training session deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteTrainingSessionCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
