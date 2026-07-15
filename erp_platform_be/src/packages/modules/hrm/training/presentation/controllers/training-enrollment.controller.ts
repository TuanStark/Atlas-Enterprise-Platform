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
  CreateTrainingEnrollmentDto,
  UpdateTrainingEnrollmentDto,
  RecordTrainingResultDto,
  IssueTrainingCertificateDto,
} from '../../application/dto/training-enrollment.dto';
import {
  CreateTrainingEnrollmentCommand,
  UpdateTrainingEnrollmentCommand,
  DeleteTrainingEnrollmentCommand,
  RecordTrainingResultCommand,
  IssueTrainingCertificateCommand,
} from '../../application/commands/training-enrollment.commands';
import {
  GetTrainingEnrollmentQuery,
  ListTrainingEnrollmentsQuery,
  ListEnrollmentsBySessionQuery,
} from '../../application/queries/training-enrollment.queries';

@ApiTags('Training Enrollments')
@Controller('training-enrollments')
export class TrainingEnrollmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll an employee to a training session' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created enrollment' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateTrainingEnrollmentDto) {
    return this.commandBus.execute(
      new CreateTrainingEnrollmentCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all training enrollments' })
  @ApiOkResponse({ description: 'List of training enrollments' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListTrainingEnrollmentsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'List enrollments by session ID' })
  @ApiOkResponse({ description: 'List of enrollments for a session' })
  listBySession(@CurrentContext() context: RequestContext, @Param('sessionId') sessionId: string) {
    return this.queryBus.execute(
      new ListEnrollmentsBySessionQuery(
        Identifier.create(context.tenantId),
        Identifier.create(sessionId),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiOkResponse({ description: 'Enrollment details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetTrainingEnrollmentQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update enrollment status/details' })
  @ApiOkResponse({ description: 'Enrollment updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingEnrollmentDto,
  ) {
    return this.commandBus.execute(
      new UpdateTrainingEnrollmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete enrollment' })
  @ApiOkResponse({ description: 'Enrollment deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteTrainingEnrollmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
      ),
    );
  }

  @Post(':id/result')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record training session result' })
  @ApiOkResponse({ description: 'Result recorded' })
  recordResult(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: RecordTrainingResultDto,
  ) {
    return this.commandBus.execute(
      new RecordTrainingResultCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Post(':id/certificate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue a training certificate' })
  @ApiOkResponse({ description: 'Certificate issued' })
  issueCertificate(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: IssueTrainingCertificateDto,
  ) {
    return this.commandBus.execute(
      new IssueTrainingCertificateCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }
}
