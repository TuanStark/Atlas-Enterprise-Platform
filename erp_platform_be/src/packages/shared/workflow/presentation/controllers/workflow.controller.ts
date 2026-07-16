import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { StartWorkflowInstanceDto, WorkflowDefinitionDto, WorkflowInstanceDto } from '../../application/dto/workflow.dto';
import { StartWorkflowInstanceCommand } from '../../application/commands/workflow.commands';
import { ListWorkflowDefinitionsQuery, GetWorkflowInstanceByRecordQuery } from '../../application/queries/workflow.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('instances')
  @RequirePermission('shared.workflow:write')
  @ApiOperation({ summary: 'Start a workflow instance' })
  @ApiCreatedResponse({ type: WorkflowInstanceDto })
  async startInstance(
    @CurrentContext() context: RequestContext,
    @Body() dto: StartWorkflowInstanceDto,
  ): Promise<WorkflowInstanceDto> {
    return this.commandBus.execute(
      new StartWorkflowInstanceCommand({
        tenantId: context.tenantId,
        definitionId: dto.definitionId,
        targetModule: dto.targetModule,
        targetEntity: dto.targetEntity,
        targetRecordId: dto.targetRecordId,
        createdByPrincipalId: context.principalId,
      }),
    );
  }

  @Get('definitions')
  @RequirePermission('shared.workflow:read')
  @ApiOperation({ summary: 'List all workflow definitions' })
  @ApiOkResponse({ type: [WorkflowDefinitionDto] })
  async listDefinitions(@CurrentContext() context: RequestContext): Promise<WorkflowDefinitionDto[]> {
    return this.queryBus.execute(new ListWorkflowDefinitionsQuery(Identifier.create(context.tenantId)));
  }

  @Get('instances/record/:recordId')
  @RequirePermission('shared.workflow:read')
  @ApiOperation({ summary: 'Get workflow instance details for record' })
  @ApiOkResponse({ type: WorkflowInstanceDto })
  async getInstanceByRecord(@Param('recordId') recordId: string): Promise<WorkflowInstanceDto | null> {
    return this.queryBus.execute(new GetWorkflowInstanceByRecordQuery(Identifier.create(recordId)));
  }
}
