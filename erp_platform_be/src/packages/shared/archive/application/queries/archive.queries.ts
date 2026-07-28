export class ListArchiveRecordsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly pageSize: number = 15,
    public readonly sourceModule?: string,
    public readonly sourceEntity?: string,
  ) {}
}

export class GetArchiveRecordQuery {
  constructor(
    public readonly tenantId: string,
    public readonly archiveId: string,
  ) {}
}
