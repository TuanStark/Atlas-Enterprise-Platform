import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AUDIT_REPOSITORY } from '../../domain/repositories/audit.repository';
import type {
  AuditRepository,
  AuditLogCreateInput,
} from '../../domain/repositories/audit.repository';

export class CreateAuditLogCommand {
  constructor(public readonly input: AuditLogCreateInput) {}
}

@CommandHandler(CreateAuditLogCommand)
export class CreateAuditLogHandler implements ICommandHandler<CreateAuditLogCommand> {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly repository: AuditRepository,
  ) {}

  async execute(command: CreateAuditLogCommand): Promise<void> {
    await this.repository.create(command.input);
  }
}
