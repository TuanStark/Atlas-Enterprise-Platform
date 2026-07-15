import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Candidate } from '../../domain/aggregates/candidate.aggregate';
import * as repo from '../../domain/repositories/candidate.repository';
import { CreateCandidateDto, UpdateCandidateDto } from '../dto/candidate.dto';

// --- Commands ---

export class CreateCandidateCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateCandidateDto,
  ) {}
}

export class UpdateCandidateCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateCandidateDto,
  ) {}
}

export class DeleteCandidateCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateCandidateCommand)
export class CreateCandidateHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateCandidateCommand>
{
  constructor(
    @Inject(repo.CANDIDATE_REPOSITORY)
    private readonly repository: repo.CandidateRepository,
  ) {
    super();
  }

  async execute(command: CreateCandidateCommand): Promise<Identifier> {
    const entity = Candidate.create({
      tenantId: command.tenantId,
      fullName: command.dto.fullName,
      email: command.dto.email,
      phone: command.dto.phone,
      source: command.dto.source,
      resumeFileId: command.dto.resumeFileId
        ? Identifier.create(command.dto.resumeFileId)
        : undefined,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateCandidateCommand)
export class UpdateCandidateHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateCandidateCommand>
{
  constructor(
    @Inject(repo.CANDIDATE_REPOSITORY)
    private readonly repository: repo.CandidateRepository,
  ) {
    super();
  }

  async execute(command: UpdateCandidateCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Candidate',
      command.id.toString(),
    );

    entity.update({
      fullName: command.dto.fullName,
      email: command.dto.email,
      phone: command.dto.phone,
      source: command.dto.source,
      resumeFileId: command.dto.resumeFileId
        ? Identifier.create(command.dto.resumeFileId)
        : undefined,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteCandidateCommand)
export class DeleteCandidateHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteCandidateCommand>
{
  constructor(
    @Inject(repo.CANDIDATE_REPOSITORY)
    private readonly repository: repo.CandidateRepository,
  ) {
    super();
  }

  async execute(command: DeleteCandidateCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Candidate',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
