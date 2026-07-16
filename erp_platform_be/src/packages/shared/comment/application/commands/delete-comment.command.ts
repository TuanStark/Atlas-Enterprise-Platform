import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';

export class DeleteCommentCommand {
  constructor(public readonly id: Identifier) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repository: CommentRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    await this.repository.delete(command.id);
  }
}
