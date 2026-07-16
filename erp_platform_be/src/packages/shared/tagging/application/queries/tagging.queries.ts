import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TAGGING_REPOSITORY } from '../../domain/repositories/tagging.repository';
import type { TaggingRepository } from '../../domain/repositories/tagging.repository';
import { TagDto, TagAssignmentDto } from '../dto/tagging.dto';

export class ListTagsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListAssignmentsForRecordQuery {
  constructor(
    public readonly targetModule: string,
    public readonly targetEntity: string,
    public readonly targetRecordId: Identifier,
  ) {}
}

@QueryHandler(ListTagsQuery)
export class ListTagsHandler implements IQueryHandler<ListTagsQuery> {
  constructor(
    @Inject(TAGGING_REPOSITORY)
    private readonly repository: TaggingRepository,
  ) {}

  async execute(query: ListTagsQuery): Promise<TagDto[]> {
    const tags = await this.repository.listTags(query.tenantId);
    return tags.map((t) => ({
      id: t.id,
      tenantId: t.tenantId,
      code: t.code,
      name: t.name,
      color: t.color || undefined,
      description: t.description || undefined,
    }));
  }
}

@QueryHandler(ListAssignmentsForRecordQuery)
export class ListAssignmentsForRecordHandler implements IQueryHandler<ListAssignmentsForRecordQuery> {
  constructor(
    @Inject(TAGGING_REPOSITORY)
    private readonly repository: TaggingRepository,
  ) {}

  async execute(query: ListAssignmentsForRecordQuery): Promise<TagAssignmentDto[]> {
    const assignments = await this.repository.findAssignmentsForRecord(
      query.targetModule,
      query.targetEntity,
      query.targetRecordId,
    );

    return assignments.map((a) => ({
      id: a.id,
      tagId: a.tagId,
      targetModule: a.targetModule,
      targetEntity: a.targetEntity,
      targetRecordId: a.targetRecordId,
      tag: {
        id: a.tag.id,
        tenantId: a.tag.tenantId,
        code: a.tag.code,
        name: a.tag.name,
        color: a.tag.color || undefined,
        description: a.tag.description || undefined,
      },
    }));
  }
}
