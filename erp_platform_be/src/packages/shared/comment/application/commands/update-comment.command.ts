import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type {
  CommentRepository,
  CommentUpdateInput,
} from '../../domain/repositories/comment.repository';

export class UpdateCommentCommand {
  constructor(
    public readonly id: Identifier,
    public readonly input: CommentUpdateInput,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repository: CommentRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<any> {
    return this.repository.update(command.id, command.input);
  }
}
