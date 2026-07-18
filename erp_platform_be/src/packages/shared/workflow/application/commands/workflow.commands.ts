import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WORKFLOW_REPOSITORY } from '../../domain/repositories/workflow.repository';
import type {
  WorkflowRepository,
  WorkflowInstanceStartInput,
} from '../../domain/repositories/workflow.repository';

export class StartWorkflowInstanceCommand {
  constructor(public readonly input: WorkflowInstanceStartInput) {}
}

@CommandHandler(StartWorkflowInstanceCommand)
export class StartWorkflowInstanceHandler implements ICommandHandler<StartWorkflowInstanceCommand> {
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly repository: WorkflowRepository,
  ) {}

  async execute(command: StartWorkflowInstanceCommand): Promise<any> {
    return this.repository.startInstance(command.input);
  }
}
