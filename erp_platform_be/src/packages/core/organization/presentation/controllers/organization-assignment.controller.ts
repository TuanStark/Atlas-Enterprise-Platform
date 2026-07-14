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
import {
  CreateOrganizationAssignmentDto,
  UpdateOrganizationAssignmentDto,
  OrganizationAssignmentDto,
} from '@core/organization/dto';
import {
  CreateOrganizationAssignmentCommand,
  UpdateOrganizationAssignmentCommand,
  DeleteOrganizationAssignmentCommand,
} from '../../application/commands';
import {
  GetOrganizationAssignmentQuery,
  ListOrganizationAssignmentsQuery,
  ListAssignmentsByEmploymentQuery,
} from '../../application/queries';

@ApiTags('Organization Assignments')
@Controller('organization-assignments')
export class OrganizationAssignmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization assignment' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created assignment' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateOrganizationAssignmentDto) {
    dto.tenantId = context.tenantId;
    return this.commandBus.execute(new CreateOrganizationAssignmentCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List all organization assignments' })
  @ApiOkResponse({ type: [OrganizationAssignmentDto] })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListOrganizationAssignmentsQuery(context.tenantId));
  }

  @Get('employment/:employmentId')
  @ApiOperation({ summary: 'List organization assignments by employment ID' })
  @ApiOkResponse({ type: [OrganizationAssignmentDto] })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListAssignmentsByEmploymentQuery(context.tenantId, employmentId),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization assignment by ID' })
  @ApiOkResponse({ type: OrganizationAssignmentDto })
  get(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(new GetOrganizationAssignmentQuery(context.tenantId, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization assignment' })
  @ApiOkResponse({ description: 'Assignment updated successfully' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationAssignmentDto,
  ) {
    return this.commandBus.execute(
      new UpdateOrganizationAssignmentCommand(context.tenantId, id, dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization assignment' })
  @ApiOkResponse({ description: 'Assignment deleted successfully' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteOrganizationAssignmentCommand(context.tenantId, id));
  }
}
