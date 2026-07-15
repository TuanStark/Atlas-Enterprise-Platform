import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { TrainingEnrollment } from '../../domain/aggregates/training-enrollment.aggregate';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { TrainingCertificate } from '../../domain/entities/training-certificate.entity';
import * as repo from '../../domain/repositories/training-enrollment.repository';
import {
  CreateTrainingEnrollmentDto,
  UpdateTrainingEnrollmentDto,
  RecordTrainingResultDto,
  IssueTrainingCertificateDto,
} from '../dto/training-enrollment.dto';

// --- Commands ---

export class CreateTrainingEnrollmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateTrainingEnrollmentDto,
  ) {}
}

export class UpdateTrainingEnrollmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateTrainingEnrollmentDto,
  ) {}
}

export class DeleteTrainingEnrollmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class RecordTrainingResultCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: RecordTrainingResultDto,
  ) {}
}

export class IssueTrainingCertificateCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: IssueTrainingCertificateDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateTrainingEnrollmentCommand)
export class CreateTrainingEnrollmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateTrainingEnrollmentCommand>
{
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {
    super();
  }

  async execute(command: CreateTrainingEnrollmentCommand): Promise<Identifier> {
    const entity = TrainingEnrollment.create({
      tenantId: command.tenantId,
      employmentId: Identifier.create(command.dto.employmentId),
      sessionId: Identifier.create(command.dto.sessionId),
      enrolledAt: command.dto.enrolledAt ? new Date(command.dto.enrolledAt) : undefined,
      status: command.dto.status,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateTrainingEnrollmentCommand)
export class UpdateTrainingEnrollmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateTrainingEnrollmentCommand>
{
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {
    super();
  }

  async execute(command: UpdateTrainingEnrollmentCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingEnrollment',
      command.id.toString(),
    );

    entity.update({
      enrolledAt: command.dto.enrolledAt ? new Date(command.dto.enrolledAt) : undefined,
      status: command.dto.status,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteTrainingEnrollmentCommand)
export class DeleteTrainingEnrollmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteTrainingEnrollmentCommand>
{
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {
    super();
  }

  async execute(command: DeleteTrainingEnrollmentCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingEnrollment',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}

@CommandHandler(RecordTrainingResultCommand)
export class RecordTrainingResultHandler
  extends BaseCommandHandler
  implements ICommandHandler<RecordTrainingResultCommand>
{
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {
    super();
  }

  async execute(command: RecordTrainingResultCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingEnrollment',
      command.id.toString(),
    );

    const result = TrainingResult.create({
      enrollmentId: entity.id,
      score: command.dto.score,
      passed: command.dto.passed,
      feedback: command.dto.feedback,
      evaluatedByEmploymentId: command.dto.evaluatedByEmploymentId
        ? Identifier.create(command.dto.evaluatedByEmploymentId)
        : undefined,
      evaluatedAt: new Date(),
    });

    entity.setResult(result);
    await this.repository.update(entity);
  }
}

@CommandHandler(IssueTrainingCertificateCommand)
export class IssueTrainingCertificateHandler
  extends BaseCommandHandler
  implements ICommandHandler<IssueTrainingCertificateCommand>
{
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {
    super();
  }

  async execute(command: IssueTrainingCertificateCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingEnrollment',
      command.id.toString(),
    );

    const certificate = TrainingCertificate.create({
      tenantId: command.tenantId,
      enrollmentId: entity.id,
      certificateNo: command.dto.certificateNo,
      issuedDate: command.dto.issuedDate ? new Date(command.dto.issuedDate) : undefined,
      expiryDate: command.dto.expiryDate ? new Date(command.dto.expiryDate) : undefined,
      fileId: command.dto.fileId ? Identifier.create(command.dto.fileId) : undefined,
    });

    entity.addCertificate(certificate);
    await this.repository.update(entity);
  }
}
