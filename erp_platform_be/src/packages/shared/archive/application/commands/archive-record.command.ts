import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IArchiveRepository } from '../../domain/repositories/archive.repository';
import { CreateArchiveRecordDto } from '../dto/archive.dto';

// --- Commands ---

export class ArchiveRecordCommand {
  constructor(
    public readonly tenantId: string,
    public readonly principalId: string,
    public readonly dto: CreateArchiveRecordDto,
  ) {}
}

export class UnarchiveRecordCommand {
  constructor(
    public readonly tenantId: string,
    public readonly archiveId: string,
  ) {}
}

// --- Handlers ---

@CommandHandler(ArchiveRecordCommand)
export class ArchiveRecordHandler implements ICommandHandler<ArchiveRecordCommand> {
  constructor(
    @Inject(IArchiveRepository)
    private readonly archiveRepository: IArchiveRepository,
  ) {}

  async execute(command: ArchiveRecordCommand): Promise<string> {
    const { tenantId, principalId, dto } = command;

    const alreadyArchived = await this.archiveRepository.existsBySource(
      tenantId,
      dto.sourceModule,
      dto.sourceEntity,
      dto.sourceRecordId,
    );

    if (alreadyArchived) {
      throw new Error('Record is already archived');
    }

    return this.archiveRepository.create({
      tenantId,
      sourceModule: dto.sourceModule,
      sourceEntity: dto.sourceEntity,
      sourceRecordId: dto.sourceRecordId,
      displayLabel: dto.displayLabel,
      snapshotData: dto.snapshotData,
      archivedBy: principalId,
      reason: dto.reason,
    });
  }
}

@CommandHandler(UnarchiveRecordCommand)
export class UnarchiveRecordHandler implements ICommandHandler<UnarchiveRecordCommand> {
  constructor(
    @Inject(IArchiveRepository)
    private readonly archiveRepository: IArchiveRepository,
  ) {}

  async execute(command: UnarchiveRecordCommand): Promise<void> {
    const record = await this.archiveRepository.findById(command.archiveId, command.tenantId);
    if (!record) {
      throw new Error('Archive record not found');
    }

    await this.archiveRepository.delete(command.archiveId, command.tenantId);
  }
}
