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
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
} from '../../application/dto/performance-review.dto';
import {
  CreatePerformanceReviewCommand,
  UpdatePerformanceReviewCommand,
  DeletePerformanceReviewCommand,
} from '../../application/commands/performance-review.commands';
import {
  GetPerformanceReviewQuery,
  ListPerformanceReviewsQuery,
  ListReviewsByEmploymentQuery,
} from '../../application/queries/performance-review.queries';

@ApiTags('Performance Reviews')
@Controller('performance-reviews')
export class PerformanceReviewController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a performance review' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created performance review' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreatePerformanceReviewDto) {
    return this.commandBus.execute(
      new CreatePerformanceReviewCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all performance reviews' })
  @ApiOkResponse({ description: 'List of performance reviews' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListPerformanceReviewsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get('employment/:employmentId')
  @ApiOperation({ summary: 'List reviews by employment ID' })
  @ApiOkResponse({ description: 'List of reviews for an employment' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListReviewsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get performance review by ID' })
  @ApiOkResponse({ description: 'Performance review details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPerformanceReviewQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update performance review' })
  @ApiOkResponse({ description: 'Performance review updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdatePerformanceReviewDto,
  ) {
    return this.commandBus.execute(
      new UpdatePerformanceReviewCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete performance review' })
  @ApiOkResponse({ description: 'Performance review deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeletePerformanceReviewCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
      ),
    );
  }
}
