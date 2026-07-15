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
import { CreateJobTitleDto, UpdateJobTitleDto } from '../../application/dto/job-title.dto';
import {
  CreateJobTitleCommand,
  UpdateJobTitleCommand,
  DeleteJobTitleCommand,
} from '../../application/commands/job-title.commands';
import {
  GetJobTitleQuery,
  ListJobTitlesQuery,
} from '../../application/queries/master-data.queries';

@ApiTags('Job Titles')
@Controller('job-titles')
export class JobTitleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a job title' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created job title' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateJobTitleDto) {
    return this.commandBus.execute(
      new CreateJobTitleCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all job titles' })
  @ApiOkResponse({ description: 'List of job titles' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListJobTitlesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job title by ID' })
  @ApiOkResponse({ description: 'Job title details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetJobTitleQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job title' })
  @ApiOkResponse({ description: 'Job title updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateJobTitleDto,
  ) {
    return this.commandBus.execute(
      new UpdateJobTitleCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job title' })
  @ApiOkResponse({ description: 'Job title deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteJobTitleCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
