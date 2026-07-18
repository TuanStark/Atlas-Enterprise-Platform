import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TAGGING_REPOSITORY } from '../../domain/repositories/tagging.repository';
import type {
  TaggingRepository,
  TagCreateInput,
  TagAssignInput,
} from '../../domain/repositories/tagging.repository';

export class CreateTagCommand {
  constructor(public readonly input: TagCreateInput) {}
}

export class AssignTagCommand {
  constructor(public readonly input: TagAssignInput) {}
}

export class RemoveTagAssignmentCommand {
  constructor(
    public readonly tagId: Identifier,
    public readonly targetRecordId: Identifier,
  ) {}
}

export class DeleteTagCommand {
  constructor(public readonly tagId: Identifier) {}
}

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand> {
  constructor(
    @Inject(TAGGING_REPOSITORY)
    private readonly repository: TaggingRepository,
  ) {}

  async execute(command: CreateTagCommand): Promise<any> {
    return this.repository.createTag(command.input);
  }
}

@CommandHandler(AssignTagCommand)
export class AssignTagHandler implements ICommandHandler<AssignTagCommand> {
  constructor(
    @Inject(TAGGING_REPOSITORY)
    private readonly repository: TaggingRepository,
  ) {}

  async execute(command: AssignTagCommand): Promise<any> {
    return this.repository.assignTag(command.input);
  }
}

@CommandHandler(RemoveTagAssignmentCommand)
export class RemoveTagAssignmentHandler implements ICommandHandler<RemoveTagAssignmentCommand> {
  constructor(
    @Inject(TAGGING_REPOSITORY)
    private readonly repository: TaggingRepository,
  ) {}

  async execute(command: RemoveTagAssignmentCommand): Promise<void> {
    await this.repository.removeAssignment(command.tagId, command.targetRecordId);
  }
}

@CommandHandler(DeleteTagCommand)
export class DeleteTagHandler implements ICommandHandler<DeleteTagCommand> {
  constructor(
    @Inject(TAGGING_REPOSITORY)
    private readonly repository: TaggingRepository,
  ) {}

  async execute(command: DeleteTagCommand): Promise<void> {
    await this.repository.deleteTag(command.tagId);
  }
}
