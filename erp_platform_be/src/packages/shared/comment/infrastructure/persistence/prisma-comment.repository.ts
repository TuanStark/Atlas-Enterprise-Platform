import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CommentRepository, CommentCreateInput, CommentUpdateInput } from '../../domain/repositories/comment.repository';
import { CommentStatus } from '@prisma/client';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CommentCreateInput): Promise<any> {
    return this.prisma.comment.create({
      data: {
        id: undefined, // generated
        tenantId: input.tenantId,
        targetModule: input.targetModule,
        targetEntity: input.targetEntity,
        targetRecordId: input.targetRecordId,
        parentCommentId: input.parentCommentId || undefined,
        authorPrincipalId: input.authorPrincipalId,
        content: input.content,
        status: CommentStatus.active,
        metadata: input.metadata || undefined,
      },
      include: {
        authorPrincipal: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async update(id: Identifier, input: CommentUpdateInput): Promise<any> {
    return this.prisma.comment.update({
      where: { id: id.getValue() },
      data: {
        content: input.content,
        status: CommentStatus.edited,
        metadata: input.metadata || undefined,
      },
      include: {
        authorPrincipal: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async delete(id: Identifier): Promise<void> {
    // Soft delete mapping
    await this.prisma.comment.update({
      where: { id: id.getValue() },
      data: {
        status: CommentStatus.deleted,
        deletedAt: new Date(),
      },
    });
  }

  async findById(id: Identifier): Promise<any | null> {
    return this.prisma.comment.findUnique({
      where: { id: id.getValue() },
      include: {
        authorPrincipal: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findForRecord(
    tenantId: Identifier,
    targetModule: string,
    targetEntity: string,
    targetRecordId: Identifier,
  ): Promise<any[]> {
    return this.prisma.comment.findMany({
      where: {
        tenantId: tenantId.getValue(),
        targetModule,
        targetEntity,
        targetRecordId: targetRecordId.getValue(),
        status: {
          in: [CommentStatus.active, CommentStatus.edited],
        },
      },
      include: {
        authorPrincipal: {
          include: {
            user: true,
          },
        },
        commentReactions: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
