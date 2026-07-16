import { ApiProperty } from '@nestjs/swagger';

export class StartWorkflowInstanceDto {
  @ApiProperty()
  definitionId: string;

  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  targetRecordId: string;
}

export class WorkflowDefinitionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class WorkflowInstanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  workflowDefinitionId: string;

  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  targetRecordId: string;

  @ApiProperty({ enum: ['running', 'completed', 'cancelled', 'rejected'] })
  status: string;

  @ApiProperty({ type: WorkflowDefinitionDto })
  definition?: WorkflowDefinitionDto;
}
