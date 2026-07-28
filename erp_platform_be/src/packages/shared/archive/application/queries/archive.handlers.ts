import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListArchiveRecordsQuery, GetArchiveRecordQuery } from './archive.queries';
import { IArchiveRepository } from '../../domain/repositories/archive.repository';

@QueryHandler(ListArchiveRecordsQuery)
export class ListArchiveRecordsHandler implements IQueryHandler<ListArchiveRecordsQuery> {
  constructor(
    @Inject(IArchiveRepository)
    private readonly repository: IArchiveRepository,
  ) {}

  async execute(query: ListArchiveRecordsQuery): Promise<{ data: any[]; total: number }> {
    return this.repository.findAll(query.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
      sourceModule: query.sourceModule,
      sourceEntity: query.sourceEntity,
    });
  }
}

@QueryHandler(GetArchiveRecordQuery)
export class GetArchiveRecordHandler implements IQueryHandler<GetArchiveRecordQuery> {
  constructor(
    @Inject(IArchiveRepository)
    private readonly repository: IArchiveRepository,
  ) {}

  async execute(query: GetArchiveRecordQuery): Promise<any | null> {
    return this.repository.findById(query.archiveId, query.tenantId);
  }
}
