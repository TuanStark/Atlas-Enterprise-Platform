import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository, CommentCreateInput } from '../../domain/repositories/comment.repository';

export class CreateCommentCommand {
  constructor(public readonly input: CommentCreateInput) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repository: CommentRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<any> {
    return this.repository.create(command.input);
  }
}
