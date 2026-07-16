import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { CommentController } from './presentation/controllers/comment.controller';
import { CreateCommentHandler } from './application/commands/create-comment.command';
import { UpdateCommentHandler } from './application/commands/update-comment.command';
import { DeleteCommentHandler } from './application/commands/delete-comment.command';
import { ListCommentsHandler } from './application/queries/list-comments.query';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { PrismaCommentRepository } from './infrastructure/persistence/prisma-comment.repository';

const CommandHandlers = [CreateCommentHandler, UpdateCommentHandler, DeleteCommentHandler];
const QueryHandlers = [ListCommentsHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [CommentController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: COMMENT_REPOSITORY,
      useClass: PrismaCommentRepository,
    },
  ],
  exports: [COMMENT_REPOSITORY],
})
export class CommentModule {}
