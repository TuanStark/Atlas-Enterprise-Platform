import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { WORKFLOW_REPOSITORY } from '../../domain/repositories/workflow.repository';
import type { WorkflowRepository } from '../../domain/repositories/workflow.repository';
import { WorkflowDefinitionDto, WorkflowInstanceDto } from '../dto/workflow.dto';

export class ListWorkflowDefinitionsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class GetWorkflowInstanceByRecordQuery {
  constructor(public readonly targetRecordId: Identifier) {}
}

@QueryHandler(ListWorkflowDefinitionsQuery)
export class ListWorkflowDefinitionsHandler implements IQueryHandler<ListWorkflowDefinitionsQuery> {
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly repository: WorkflowRepository,
  ) {}

  async execute(query: ListWorkflowDefinitionsQuery): Promise<WorkflowDefinitionDto[]> {
    const definitions = await this.repository.listDefinitions(query.tenantId);
    return definitions.map((d) => ({
      id: d.id,
      tenantId: d.tenantId,
      code: d.code,
      name: d.name || '',
      description: d.description || undefined,
    }));
  }
}

@QueryHandler(GetWorkflowInstanceByRecordQuery)
export class GetWorkflowInstanceByRecordHandler implements IQueryHandler<GetWorkflowInstanceByRecordQuery> {
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly repository: WorkflowRepository,
  ) {}

  async execute(query: GetWorkflowInstanceByRecordQuery): Promise<WorkflowInstanceDto | null> {
    const inst = await this.repository.findInstanceByRecord(query.targetRecordId);
    if (!inst) return null;

    return {
      id: inst.id,
      tenantId: inst.tenantId,
      workflowDefinitionId: inst.workflowDefinitionId,
      targetModule: inst.targetModule,
      targetEntity: inst.targetEntity,
      targetRecordId: inst.targetRecordId,
      status: inst.status,
      definition: inst.workflowDefinition
        ? {
            id: inst.workflowDefinition.id,
            tenantId: inst.workflowDefinition.tenantId,
            code: inst.workflowDefinition.code,
            name: inst.workflowDefinition.name || '',
            description: inst.workflowDefinition.description || undefined,
          }
        : undefined,
    };
  }
}
