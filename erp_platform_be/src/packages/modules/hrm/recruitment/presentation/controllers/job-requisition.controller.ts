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
  CreateJobRequisitionDto,
  UpdateJobRequisitionDto,
} from '../../application/dto/job-requisition.dto';
import {
  CreateJobRequisitionCommand,
  UpdateJobRequisitionCommand,
  ApproveJobRequisitionCommand,
  CloseJobRequisitionCommand,
  CancelJobRequisitionCommand,
} from '../../application/commands/job-requisition.commands';
import {
  GetJobRequisitionQuery,
  ListJobRequisitionsQuery,
} from '../../application/queries/job-requisition.queries';

@ApiTags('Job Requisitions')
@Controller('job-requisitions')
export class JobRequisitionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a job requisition' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created job requisition' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateJobRequisitionDto) {
    return this.commandBus.execute(
      new CreateJobRequisitionCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all job requisitions' })
  @ApiOkResponse({ description: 'List of job requisitions' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListJobRequisitionsQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job requisition by ID' })
  @ApiOkResponse({ description: 'Job requisition details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetJobRequisitionQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job requisition' })
  @ApiOkResponse({ description: 'Job requisition updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateJobRequisitionDto,
  ) {
    return this.commandBus.execute(
      new UpdateJobRequisitionCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve job requisition' })
  @ApiOkResponse({ description: 'Job requisition approved' })
  approve(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new ApproveJobRequisitionCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close job requisition' })
  @ApiOkResponse({ description: 'Job requisition closed' })
  close(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new CloseJobRequisitionCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel job requisition' })
  @ApiOkResponse({ description: 'Job requisition cancelled' })
  cancel(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new CancelJobRequisitionCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
