import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { CommentDto } from '../dto/comment.dto';

export class ListCommentsQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly targetModule: string,
    public readonly targetEntity: string,
    public readonly targetRecordId: Identifier,
  ) {}
}

@QueryHandler(ListCommentsQuery)
export class ListCommentsHandler implements IQueryHandler<ListCommentsQuery> {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repository: CommentRepository,
  ) {}

  async execute(query: ListCommentsQuery): Promise<CommentDto[]> {
    const comments = await this.repository.findForRecord(
      query.tenantId,
      query.targetModule,
      query.targetEntity,
      query.targetRecordId,
    );

    return comments.map((comment) => {
      const authorName =
        comment.authorPrincipal?.user?.username || comment.authorPrincipal?.user?.email || 'User';
      return {
        id: comment.id,
        tenantId: comment.tenantId,
        targetModule: comment.targetModule,
        targetEntity: comment.targetEntity,
        targetRecordId: comment.targetRecordId,
        parentCommentId: comment.parentCommentId || undefined,
        content: comment.content,
        status: comment.status,
        authorPrincipalId: comment.authorPrincipalId,
        authorName,
        authorAvatarUrl: undefined, // Add mapping if user profile supports avatar
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || undefined,
      };
    });
  }
}
