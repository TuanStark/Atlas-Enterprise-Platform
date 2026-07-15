import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  CreateJobApplicationDto,
  UpdateApplicationStatusDto,
  UpdateApplicationStageDto,
  ScheduleInterviewDto,
  CreateJobOfferDto,
  UpdateJobOfferStatusDto,
  HireCandidateDto,
} from '../../application/dto/job-application.dto';
import {
  CreateJobApplicationCommand,
  UpdateApplicationStatusCommand,
  UpdateApplicationStageCommand,
  ScheduleInterviewCommand,
  CreateJobOfferCommand,
  UpdateJobOfferStatusCommand,
  HireCandidateCommand,
} from '../../application/commands/job-application.commands';
import {
  GetJobApplicationQuery,
  ListJobApplicationsQuery,
} from '../../application/queries/job-application.queries';

@ApiTags('Job Applications')
@Controller('job-applications')
export class JobApplicationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply for a job posting' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created application' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateJobApplicationDto) {
    return this.commandBus.execute(
      new CreateJobApplicationCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all job applications' })
  @ApiOkResponse({ description: 'List of job applications' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListJobApplicationsQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job application by ID' })
  @ApiOkResponse({ description: 'Job application details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetJobApplicationQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update application status' })
  @ApiOkResponse({ description: 'Application status updated' })
  updateStatus(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateApplicationStatusCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Patch(':id/stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update application stage' })
  @ApiOkResponse({ description: 'Application stage updated' })
  updateStage(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStageDto,
  ) {
    return this.commandBus.execute(
      new UpdateApplicationStageCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Post(':id/interviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule an interview' })
  @ApiCreatedResponse({ description: 'Interview scheduled' })
  scheduleInterview(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return this.commandBus.execute(
      new ScheduleInterviewCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Post(':id/offers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make a job offer' })
  @ApiCreatedResponse({ description: 'Job offer created' })
  makeOffer(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: CreateJobOfferDto,
  ) {
    return this.commandBus.execute(
      new CreateJobOfferCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Patch(':applicationId/offers/:offerId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job offer status' })
  @ApiOkResponse({ description: 'Job offer status updated' })
  updateOfferStatus(
    @CurrentContext() context: RequestContext,
    @Param('applicationId') applicationId: string,
    @Param('offerId') offerId: string,
    @Body() dto: UpdateJobOfferStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateJobOfferStatusCommand(
        Identifier.create(context.tenantId),
        Identifier.create(applicationId),
        Identifier.create(offerId),
        dto,
      ),
    );
  }

  @Post(':id/hire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hire candidate' })
  @ApiOkResponse({ description: 'Hiring record created' })
  hire(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: HireCandidateDto,
  ) {
    return this.commandBus.execute(
      new HireCandidateCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }
}
