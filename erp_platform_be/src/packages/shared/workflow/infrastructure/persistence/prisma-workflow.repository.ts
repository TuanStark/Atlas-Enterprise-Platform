import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  WorkflowRepository,
  WorkflowInstanceStartInput,
} from '../../domain/repositories/workflow.repository';
import { WorkflowInstanceStatus } from '@prisma/client';

@Injectable()
export class PrismaWorkflowRepository implements WorkflowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listDefinitions(tenantId: Identifier): Promise<any[]> {
    return this.prisma.workflowDefinition.findMany({
      where: { tenantId: tenantId.getValue() },
      include: {
        workflowDefinitionWorkflowSteps: true,
      },
    });
  }

  async startInstance(input: WorkflowInstanceStartInput): Promise<any> {
    // Find initial step
    const firstStep = await this.prisma.workflowStep.findFirst({
      where: {
        workflowDefinitionId: input.definitionId,
        stepType: 'start' as any, // mapping type if custom enum
      },
    });

    return this.prisma.workflowInstance.create({
      data: {
        id: undefined,
        workflowDefinitionId: input.definitionId,
        targetRecordId: input.targetRecordId,
        currentStepId: firstStep?.id || null,
        status: WorkflowInstanceStatus.running,
        startedByPrincipalId: input.createdByPrincipalId,
        startedAt: new Date(),
      },
      include: {
        workflowDefinition: true,
      },
    });
  }

  async findInstanceByRecord(targetRecordId: Identifier): Promise<any | null> {
    return this.prisma.workflowInstance.findFirst({
      where: { targetRecordId: targetRecordId.getValue() },
      include: {
        workflowDefinition: true,
        currentStep: true,
        workflowInstanceWorkflowTasks: true,
      },
    });
  }
}
