import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';

export interface AuditLogDetailInput {
  fieldName: string;
  oldValue?: string;
  newValue?: string;
}

export interface AuditLogCreateInput {
  tenantId: string;
  targetModule?: string;
  targetEntity?: string;
  targetRecordId?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject' | 'export' | 'import';
  actorPrincipalId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: any;
  details?: AuditLogDetailInput[];
}

export interface AuditRepository {
  create(input: AuditLogCreateInput): Promise<void>;
  findById(id: Identifier): Promise<any | null>;
  findAll(tenantId: Identifier): Promise<any[]>;
}
