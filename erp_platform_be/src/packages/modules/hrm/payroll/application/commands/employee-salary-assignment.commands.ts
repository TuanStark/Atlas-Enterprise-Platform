import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EmployeeSalaryAssignment } from '../../domain/aggregates/employee-salary-assignment.aggregate';
import * as repo from '../../domain/repositories/employee-salary-assignment.repository';
import {
  CreateEmployeeSalaryAssignmentDto,
  UpdateEmployeeSalaryAssignmentDto,
} from '../dto/employee-salary-assignment.dto';

// --- Commands ---

export class CreateEmployeeSalaryAssignmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateEmployeeSalaryAssignmentDto,
  ) {}
}

export class UpdateEmployeeSalaryAssignmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateEmployeeSalaryAssignmentDto,
  ) {}
}

export class DeleteEmployeeSalaryAssignmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateEmployeeSalaryAssignmentCommand)
export class CreateEmployeeSalaryAssignmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateEmployeeSalaryAssignmentCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.EmployeeSalaryAssignmentRepository,
  ) {
    super();
  }

  async execute(command: CreateEmployeeSalaryAssignmentCommand): Promise<Identifier> {
    const entity = EmployeeSalaryAssignment.create({
      tenantId: command.tenantId,
      employmentId: Identifier.create(command.dto.employmentId),
      salaryStructureId: Identifier.create(command.dto.salaryStructureId),
      effectiveFrom: command.dto.effectiveFrom ? new Date(command.dto.effectiveFrom) : undefined,
      effectiveTo: command.dto.effectiveTo ? new Date(command.dto.effectiveTo) : undefined,
      baseSalary: command.dto.baseSalary,
      currency: command.dto.currency,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateEmployeeSalaryAssignmentCommand)
export class UpdateEmployeeSalaryAssignmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateEmployeeSalaryAssignmentCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.EmployeeSalaryAssignmentRepository,
  ) {
    super();
  }

  async execute(command: UpdateEmployeeSalaryAssignmentCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'EmployeeSalaryAssignment',
      command.id.toString(),
    );

    entity.update({
      employmentId: command.dto.employmentId
        ? Identifier.create(command.dto.employmentId)
        : undefined,
      salaryStructureId: command.dto.salaryStructureId
        ? Identifier.create(command.dto.salaryStructureId)
        : undefined,
      effectiveFrom: command.dto.effectiveFrom ? new Date(command.dto.effectiveFrom) : undefined,
      effectiveTo: command.dto.effectiveTo ? new Date(command.dto.effectiveTo) : undefined,
      baseSalary: command.dto.baseSalary,
      currency: command.dto.currency,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteEmployeeSalaryAssignmentCommand)
export class DeleteEmployeeSalaryAssignmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteEmployeeSalaryAssignmentCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.EmployeeSalaryAssignmentRepository,
  ) {
    super();
  }

  async execute(command: DeleteEmployeeSalaryAssignmentCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'EmployeeSalaryAssignment',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
