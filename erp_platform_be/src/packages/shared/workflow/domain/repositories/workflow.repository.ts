import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const WORKFLOW_REPOSITORY = 'WORKFLOW_REPOSITORY';

export interface WorkflowInstanceStartInput {
  tenantId: string;
  definitionId: string;
  targetModule: string;
  targetEntity: string;
  targetRecordId: string;
  createdByPrincipalId: string;
}

export interface WorkflowRepository {
  listDefinitions(tenantId: Identifier): Promise<any[]>;
  startInstance(input: WorkflowInstanceStartInput): Promise<any>;
  findInstanceByRecord(targetRecordId: Identifier): Promise<any | null>;
}
