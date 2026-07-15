import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateJobPostingDto, UpdateJobPostingDto } from '../../application/dto/job-posting.dto';
import {
  CreateJobPostingCommand,
  UpdateJobPostingCommand,
  PublishJobPostingCommand,
  CloseJobPostingCommand,
} from '../../application/commands/job-posting.commands';
import {
  GetJobPostingQuery,
  ListJobPostingsQuery,
} from '../../application/queries/job-posting.queries';

@ApiTags('Job Postings')
@Controller('job-postings')
export class JobPostingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a job posting' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created job posting' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateJobPostingDto) {
    return this.commandBus.execute(
      new CreateJobPostingCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all job postings' })
  @ApiOkResponse({ description: 'List of job postings' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListJobPostingsQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job posting by ID' })
  @ApiOkResponse({ description: 'Job posting details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetJobPostingQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job posting' })
  @ApiOkResponse({ description: 'Job posting updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
  ) {
    return this.commandBus.execute(
      new UpdateJobPostingCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish job posting' })
  @ApiOkResponse({ description: 'Job posting published' })
  publish(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new PublishJobPostingCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close job posting' })
  @ApiOkResponse({ description: 'Job posting closed' })
  close(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new CloseJobPostingCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
