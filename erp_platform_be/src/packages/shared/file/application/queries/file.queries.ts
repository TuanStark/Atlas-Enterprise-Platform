import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { FILE_REPOSITORY } from '../../domain/repositories/file.repository';
import type { FileRepository } from '../../domain/repositories/file.repository';
import { FileDto } from '../dto/file.dto';

export class ListFilesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class GetFileQuery {
  constructor(public readonly id: Identifier) {}
}

@QueryHandler(ListFilesQuery)
export class ListFilesHandler implements IQueryHandler<ListFilesQuery> {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly repository: FileRepository,
  ) {}

  async execute(query: ListFilesQuery): Promise<FileDto[]> {
    const files = await this.repository.listAll(query.tenantId);
    return files.map((f) => ({
      id: f.id,
      tenantId: f.tenantId,
      code: f.code || undefined,
      fileName: f.fileName,
      mimeType: f.mimeType,
      extension: f.extension,
      visibility: f.visibility,
      size: f.size,
      checksum: f.checksum || undefined,
      metadata: f.metadata || undefined,
      createdAt: f.createdAt,
    }));
  }
}

@QueryHandler(GetFileQuery)
export class GetFileHandler implements IQueryHandler<GetFileQuery> {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly repository: FileRepository,
  ) {}

  async execute(query: GetFileQuery): Promise<FileDto | null> {
    const file = await this.repository.findById(query.id);
    if (!file) return null;
    return {
      id: file.id,
      tenantId: file.tenantId,
      code: file.code || undefined,
      fileName: file.fileName,
      mimeType: file.mimeType,
      extension: file.extension,
      visibility: file.visibility,
      size: file.size,
      checksum: file.checksum || undefined,
      metadata: file.metadata || undefined,
      createdAt: file.createdAt,
    };
  }
}
