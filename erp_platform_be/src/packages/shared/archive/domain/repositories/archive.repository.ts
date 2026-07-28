export interface IArchiveRepository {
  create(data: {
    tenantId: string;
    sourceModule: string;
    sourceEntity: string;
    sourceRecordId: string;
    displayLabel: string;
    snapshotData?: any;
    archivedBy: string;
    reason?: string;
  }): Promise<string>;

  delete(id: string, tenantId: string): Promise<void>;

  findById(id: string, tenantId: string): Promise<any | null>;

  findAll(
    tenantId: string,
    params: {
      page?: number;
      pageSize?: number;
      sourceModule?: string;
      sourceEntity?: string;
    },
  ): Promise<{ data: any[]; total: number }>;

  existsBySource(
    tenantId: string,
    sourceModule: string,
    sourceEntity: string,
    sourceRecordId: string,
  ): Promise<boolean>;

  findArchivedRecordIds(
    tenantId: string,
    sourceModule: string,
    sourceEntity: string,
  ): Promise<string[]>;
}

export const IArchiveRepository = Symbol('IArchiveRepository');
