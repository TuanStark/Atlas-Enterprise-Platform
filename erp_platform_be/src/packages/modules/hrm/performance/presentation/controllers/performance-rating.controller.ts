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
  CreatePerformanceRatingDto,
  UpdatePerformanceRatingDto,
} from '../../application/dto/performance-rating.dto';
import {
  CreatePerformanceRatingCommand,
  UpdatePerformanceRatingCommand,
  DeletePerformanceRatingCommand,
} from '../../application/commands/performance-rating.commands';
import {
  GetPerformanceRatingQuery,
  ListPerformanceRatingsQuery,
} from '../../application/queries/performance-rating.queries';

@ApiTags('Performance Ratings')
@Controller('performance-ratings')
export class PerformanceRatingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a performance rating scale' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created rating scale' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreatePerformanceRatingDto) {
    return this.commandBus.execute(
      new CreatePerformanceRatingCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all performance rating scales' })
  @ApiOkResponse({ description: 'List of rating scales' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListPerformanceRatingsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rating scale by ID' })
  @ApiOkResponse({ description: 'Rating scale details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPerformanceRatingQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update rating scale' })
  @ApiOkResponse({ description: 'Rating scale updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdatePerformanceRatingDto,
  ) {
    return this.commandBus.execute(
      new UpdatePerformanceRatingCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete rating scale' })
  @ApiOkResponse({ description: 'Rating scale deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeletePerformanceRatingCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
      ),
    );
  }
}
