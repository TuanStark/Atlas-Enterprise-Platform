import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AUDIT_REPOSITORY } from '../../domain/repositories/audit.repository';
import type { AuditRepository } from '../../domain/repositories/audit.repository';
import { AuditLogDto } from '../dto/audit-log.dto';

export class ListAuditLogsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

@QueryHandler(ListAuditLogsQuery)
export class ListAuditLogsHandler implements IQueryHandler<ListAuditLogsQuery> {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly repository: AuditRepository,
  ) {}

  async execute(query: ListAuditLogsQuery): Promise<AuditLogDto[]> {
    const logs = await this.repository.findAll(query.tenantId);

    return logs.map((log) => {
      const actorName =
        log.actorPrincipal?.user?.username || log.actorPrincipal?.user?.email || 'System';
      return {
        id: log.id,
        tenantId: log.tenantId,
        targetModule: log.targetModule || undefined,
        targetEntity: log.targetEntity || undefined,
        targetRecordId: log.targetRecordId || undefined,
        action: log.action,
        actorPrincipalId: log.actorPrincipalId || undefined,
        actorName,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        requestId: log.requestId || undefined,
        metadata: log.metadata,
        createdAt: log.createdAt,
        details: (log.auditLogAuditDetails || []).map((detail: any) => ({
          id: detail.id,
          fieldName: detail.fieldName,
          oldValue: detail.oldValue || undefined,
          newValue: detail.newValue || undefined,
        })),
      };
    });
  }
}
