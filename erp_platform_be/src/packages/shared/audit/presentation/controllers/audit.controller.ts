import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ListAuditLogsQuery } from '../../application/queries/list-audit-logs.query';
import { AuditLogDto } from '../../application/dto/audit-log.dto';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermission('shared.audit:read')
  @ApiOperation({ summary: 'List all audit logs' })
  @ApiOkResponse({ type: [AuditLogDto] })
  async list(@CurrentContext() context: RequestContext): Promise<AuditLogDto[]> {
    return this.queryBus.execute(
      new ListAuditLogsQuery(Identifier.create(context.tenantId)),
    );
  }
}
