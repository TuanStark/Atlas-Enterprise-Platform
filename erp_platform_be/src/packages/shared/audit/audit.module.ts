import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { AuditController } from './presentation/controllers/audit.controller';
import { CreateAuditLogHandler } from './application/commands/create-audit-log.command';
import { ListAuditLogsHandler } from './application/queries/list-audit-logs.query';
import { AUDIT_REPOSITORY } from './domain/repositories/audit.repository';
import { PrismaAuditRepository } from './infrastructure/persistence/prisma-audit.repository';

const CommandHandlers = [CreateAuditLogHandler];
const QueryHandlers = [ListAuditLogsHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [AuditController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: AUDIT_REPOSITORY,
      useClass: PrismaAuditRepository,
    },
  ],
  exports: [AUDIT_REPOSITORY],
})
export class AuditModule {}
