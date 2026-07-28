export interface ArchiveRecord {
  id: string;
  tenantId: string;
  sourceModule: string;
  sourceEntity: string;
  sourceRecordId: string;
  displayLabel: string;
  snapshotData?: Record<string, any>;
  archivedBy: string;
  archivedAt: string;
  reason?: string;
  principal?: {
    displayName: string;
  };
}

export interface CreateArchiveRecordDto {
  sourceModule: string;
  sourceEntity: string;
  sourceRecordId: string;
  displayLabel: string;
  snapshotData?: Record<string, any>;
  reason?: string;
}

export const SOURCE_MODULE_LABELS: Record<string, string> = {
  hrm: 'Nhân sự',
};

export const SOURCE_ENTITY_LABELS: Record<string, string> = {
  contract: 'Hợp đồng',
  employee: 'Nhân viên',
  leave_request: 'Đơn nghỉ phép',
};
