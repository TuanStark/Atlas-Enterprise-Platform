import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Employment } from '../../domain/aggregates/employment.aggregate';
import { EmploymentDomainService } from '../../domain/services/employment-domain.service';
import * as repo from '../../domain/repositories/employment.repository';
import {
  CreateEmploymentDto,
  UpdateEmploymentStatusDto,
  TerminateEmploymentDto,
  CreateEmploymentContractDto,
} from '../dto/employment.dto';

// --- Commands ---

export class CreateEmploymentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateEmploymentDto,
  ) {}
}

export class UpdateEmploymentStatusCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly principalId: string,
    public readonly dto: UpdateEmploymentStatusDto,
  ) {}
}

export class TerminateEmploymentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly principalId: string,
    public readonly dto: TerminateEmploymentDto,
  ) {}
}



// --- Handlers ---

@CommandHandler(CreateEmploymentCommand)
export class CreateEmploymentHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateEmploymentCommand>
{
  constructor(private readonly domainService: EmploymentDomainService) {
    super();
  }

  async execute(command: CreateEmploymentCommand): Promise<Identifier> {
    const { tenantId, dto } = command;

    const employment = await this.domainService.create({
      tenantId,
      employeeId: Identifier.create(dto.employeeId),
      employmentTypeId: Identifier.create(dto.employmentTypeId),
      employeeCode: dto.employeeCode,
      hireDate: new Date(dto.hireDate),
      probationStartDate: dto.probationStartDate ? new Date(dto.probationStartDate) : undefined,
      probationEndDate: dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
    });

    return employment.id;
  }
}

@CommandHandler(UpdateEmploymentStatusCommand)
export class UpdateEmploymentStatusHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateEmploymentStatusCommand>
{
  constructor(
    @Inject(repo.EMPLOYMENT_REPOSITORY)
    private readonly repository: repo.EmploymentRepository,
  ) {
    super();
  }

  async execute(command: UpdateEmploymentStatusCommand): Promise<void> {
    const employment = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Employment',
      command.id.toString(),
    );

    employment.changeStatus(
      command.dto.status,
      new Date(command.dto.effectiveDate),
      command.dto.reason,
      command.principalId,
    );

    await this.repository.update(employment);
  }
}

@CommandHandler(TerminateEmploymentCommand)
export class TerminateEmploymentHandler
  extends BaseCommandHandler
  implements ICommandHandler<TerminateEmploymentCommand>
{
  constructor(
    @Inject(repo.EMPLOYMENT_REPOSITORY)
    private readonly repository: repo.EmploymentRepository,
  ) {
    super();
  }

  async execute(command: TerminateEmploymentCommand): Promise<void> {
    const employment = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Employment',
      command.id.toString(),
    );

    employment.terminate(
      new Date(command.dto.terminationDate),
      command.dto.reason,
      command.principalId,
    );

    await this.repository.update(employment);
  }
}

