import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateTagDto, AssignTagDto, TagDto, TagAssignmentDto } from '../../application/dto/tagging.dto';
import { CreateTagCommand, AssignTagCommand, RemoveTagAssignmentCommand, DeleteTagCommand } from '../../application/commands/tagging.commands';
import { ListTagsQuery, ListAssignmentsForRecordQuery } from '../../application/queries/tagging.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Tags & Tagging')
@Controller('tags')
export class TaggingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission('shared.tagging:write')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiCreatedResponse({ type: TagDto })
  async create(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateTagDto,
  ): Promise<TagDto> {
    return this.commandBus.execute(
      new CreateTagCommand({
        tenantId: context.tenantId,
        code: dto.code,
        name: dto.name,
        color: dto.color,
        description: dto.description,
        createdByPrincipalId: context.principalId,
      }),
    );
  }

  @Delete(':id')
  @RequirePermission('shared.tagging:write')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiOkResponse({ description: 'Tag and its assignments deleted successfully' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteTagCommand(Identifier.create(id)));
  }

  @Get()
  @RequirePermission('shared.tagging:read')
  @ApiOperation({ summary: 'List all tags for tenant' })
  @ApiOkResponse({ type: [TagDto] })
  async list(@CurrentContext() context: RequestContext): Promise<TagDto[]> {
    return this.queryBus.execute(new ListTagsQuery(Identifier.create(context.tenantId)));
  }

  @Post('assign')
  @RequirePermission('shared.tagging:write')
  @ApiOperation({ summary: 'Assign tag to a record' })
  @ApiCreatedResponse({ type: TagAssignmentDto })
  async assign(
    @CurrentContext() context: RequestContext,
    @Body() dto: AssignTagDto,
  ): Promise<TagAssignmentDto> {
    return this.commandBus.execute(
      new AssignTagCommand({
        tagId: dto.tagId,
        targetModule: dto.targetModule,
        targetEntity: dto.targetEntity,
        targetRecordId: dto.targetRecordId,
        assignedByPrincipalId: context.principalId,
      }),
    );
  }

  @Delete('assign/:tagId/:targetRecordId')
  @RequirePermission('shared.tagging:write')
  @ApiOperation({ summary: 'Remove tag assignment from record' })
  @ApiOkResponse({ description: 'Tag assignment removed successfully' })
  async unassign(
    @Param('tagId') tagId: string,
    @Param('targetRecordId') targetRecordId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new RemoveTagAssignmentCommand(Identifier.create(tagId), Identifier.create(targetRecordId)),
    );
  }

  @Get('assignments/:targetModule/:targetEntity/:targetRecordId')
  @RequirePermission('shared.tagging:read')
  @ApiOperation({ summary: 'List all tags assigned to a record' })
  @ApiOkResponse({ type: [TagAssignmentDto] })
  async listAssignments(
    @Param('targetModule') targetModule: string,
    @Param('targetEntity') targetEntity: string,
    @Param('targetRecordId') targetRecordId: string,
  ): Promise<TagAssignmentDto[]> {
    return this.queryBus.execute(
      new ListAssignmentsForRecordQuery(
        targetModule,
        targetEntity,
        Identifier.create(targetRecordId),
      ),
    );
  }
}
