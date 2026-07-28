export class CreateArchiveRecordDto {
  sourceModule: string;
  sourceEntity: string;
  sourceRecordId: string;
  displayLabel: string;
  snapshotData?: any;
  reason?: string;
}
