import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateCommentDto, UpdateCommentDto, CommentDto } from '../../application/dto/comment.dto';
import { CreateCommentCommand } from '../../application/commands/create-comment.command';
import { UpdateCommentCommand } from '../../application/commands/update-comment.command';
import { DeleteCommentCommand } from '../../application/commands/delete-comment.command';
import { ListCommentsQuery } from '../../application/queries/list-comments.query';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission('shared.comment:write')
  @ApiOperation({ summary: 'Create comment' })
  @ApiCreatedResponse({ type: CommentDto })
  async create(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentDto> {
    const rawResult = await this.commandBus.execute(
      new CreateCommentCommand({
        tenantId: context.tenantId,
        targetModule: dto.targetModule,
        targetEntity: dto.targetEntity,
        targetRecordId: dto.targetRecordId,
        parentCommentId: dto.parentCommentId,
        authorPrincipalId: context.principalId,
        content: dto.content,
        metadata: dto.metadata,
      }),
    );

    const authorName = rawResult.authorPrincipal?.user?.username || rawResult.authorPrincipal?.user?.email || 'User';
    return {
      id: rawResult.id,
      tenantId: rawResult.tenantId,
      targetModule: rawResult.targetModule,
      targetEntity: rawResult.targetEntity,
      targetRecordId: rawResult.targetRecordId,
      parentCommentId: rawResult.parentCommentId || undefined,
      content: rawResult.content,
      status: rawResult.status,
      authorPrincipalId: rawResult.authorPrincipalId,
      authorName,
      createdAt: rawResult.createdAt,
      updatedAt: rawResult.updatedAt || undefined,
    };
  }

  @Put(':id')
  @RequirePermission('shared.comment:write')
  @ApiOperation({ summary: 'Update comment' })
  @ApiOkResponse({ type: CommentDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentDto> {
    const rawResult = await this.commandBus.execute(
      new UpdateCommentCommand(Identifier.create(id), {
        content: dto.content,
        metadata: dto.metadata,
      }),
    );

    const authorName = rawResult.authorPrincipal?.user?.username || rawResult.authorPrincipal?.user?.email || 'User';
    return {
      id: rawResult.id,
      tenantId: rawResult.tenantId,
      targetModule: rawResult.targetModule,
      targetEntity: rawResult.targetEntity,
      targetRecordId: rawResult.targetRecordId,
      parentCommentId: rawResult.parentCommentId || undefined,
      content: rawResult.content,
      status: rawResult.status,
      authorPrincipalId: rawResult.authorPrincipalId,
      authorName,
      createdAt: rawResult.createdAt,
      updatedAt: rawResult.updatedAt || undefined,
    };
  }

  @Delete(':id')
  @RequirePermission('shared.comment:write')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiOkResponse({ description: 'Comment soft deleted successfully' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(Identifier.create(id)));
  }

  @Get('/:targetModule/:targetEntity/:targetRecordId')
  @RequirePermission('shared.comment:read')
  @ApiOperation({ summary: 'List comments for a record' })
  @ApiOkResponse({ type: [CommentDto] })
  async listForRecord(
    @CurrentContext() context: RequestContext,
    @Param('targetModule') targetModule: string,
    @Param('targetEntity') targetEntity: string,
    @Param('targetRecordId') targetRecordId: string,
  ): Promise<CommentDto[]> {
    return this.queryBus.execute(
      new ListCommentsQuery(
        Identifier.create(context.tenantId),
        targetModule,
        targetEntity,
        Identifier.create(targetRecordId),
      ),
    );
  }
}
