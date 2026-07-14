import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateOrganizationAssignmentDto,
  UpdateOrganizationAssignmentDto,
} from '@core/organization/dto';
import { ORGANIZATION_ASSIGNMENT_REPOSITORY } from '@core/organization/domain/repositories/organization-assignment.repository';
import type { OrganizationAssignmentRepository } from '@core/organization/domain/repositories/organization-assignment.repository';
import { OrganizationAssignment } from '@core/organization/domain/entities/organization-assignment';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

// Create
export class CreateOrganizationAssignmentCommand {
  constructor(public readonly dto: CreateOrganizationAssignmentDto) {}
}

@CommandHandler(CreateOrganizationAssignmentCommand)
export class CreateOrganizationAssignmentHandler implements ICommandHandler<CreateOrganizationAssignmentCommand> {
  constructor(
    @Inject(ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly repository: OrganizationAssignmentRepository,
  ) {}

  async execute(command: CreateOrganizationAssignmentCommand): Promise<Result<string>> {
    const { dto } = command;
    const tenantId = Identifier.create(dto.tenantId);

    const assignment = OrganizationAssignment.create({
      tenantId,
      employmentId: Identifier.create(dto.employmentId),
      departmentId: Identifier.create(dto.departmentId),
      positionId: Identifier.create(dto.positionId),
      jobTitleId: dto.jobTitleId ? Identifier.create(dto.jobTitleId) : undefined,
      managerEmploymentId: dto.managerEmploymentId
        ? Identifier.create(dto.managerEmploymentId)
        : undefined,
      workLocationId: dto.workLocationId ? Identifier.create(dto.workLocationId) : undefined,
      costCenterId: dto.costCenterId ? Identifier.create(dto.costCenterId) : undefined,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      isPrimary: dto.isPrimary,
      status: dto.status,
    });

    await this.repository.save(assignment);
    return Result.success(assignment.id.getValue(), {
      statusCode: HttpStatus.CREATED,
    });
  }
}

// Update
export class UpdateOrganizationAssignmentCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
    public readonly dto: UpdateOrganizationAssignmentDto,
  ) {}
}

@CommandHandler(UpdateOrganizationAssignmentCommand)
export class UpdateOrganizationAssignmentHandler implements ICommandHandler<UpdateOrganizationAssignmentCommand> {
  constructor(
    @Inject(ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly repository: OrganizationAssignmentRepository,
  ) {}

  async execute(command: UpdateOrganizationAssignmentCommand): Promise<Result<void>> {
    const { tenantId, id, dto } = command;
    const tenant = Identifier.create(tenantId);
    const assignmentId = Identifier.create(id);

    const assignment = await this.repository.findById(tenant, assignmentId);
    if (!assignment) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_ASSIGNMENT_NOT_FOUND',
        message: 'Organization assignment not found.',
      });
    }

    assignment.updateAssignmentDetails({
      departmentId: dto.departmentId ? Identifier.create(dto.departmentId) : undefined,
      positionId: dto.positionId ? Identifier.create(dto.positionId) : undefined,
      jobTitleId:
        dto.jobTitleId !== undefined
          ? dto.jobTitleId
            ? Identifier.create(dto.jobTitleId)
            : null
          : undefined,
      managerEmploymentId:
        dto.managerEmploymentId !== undefined
          ? dto.managerEmploymentId
            ? Identifier.create(dto.managerEmploymentId)
            : null
          : undefined,
      workLocationId:
        dto.workLocationId !== undefined
          ? dto.workLocationId
            ? Identifier.create(dto.workLocationId)
            : null
          : undefined,
      costCenterId:
        dto.costCenterId !== undefined
          ? dto.costCenterId
            ? Identifier.create(dto.costCenterId)
            : null
          : undefined,
    });

    if (dto.effectiveFrom) {
      assignment.updateEffectiveDates(
        new Date(dto.effectiveFrom),
        dto.effectiveTo !== undefined
          ? dto.effectiveTo
            ? new Date(dto.effectiveTo)
            : undefined
          : assignment.effectiveTo,
      );
    } else if (dto.effectiveTo !== undefined) {
      assignment.updateEffectiveDates(
        assignment.effectiveFrom,
        dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      );
    }

    if (dto.isPrimary !== undefined) {
      assignment.setPrimary(dto.isPrimary);
    }
    if (dto.status) {
      assignment.updateStatus(dto.status);
    }

    await this.repository.update(assignment);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}

// Delete
export class DeleteOrganizationAssignmentCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {}
}

@CommandHandler(DeleteOrganizationAssignmentCommand)
export class DeleteOrganizationAssignmentHandler implements ICommandHandler<DeleteOrganizationAssignmentCommand> {
  constructor(
    @Inject(ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly repository: OrganizationAssignmentRepository,
  ) {}

  async execute(command: DeleteOrganizationAssignmentCommand): Promise<Result<void>> {
    const { tenantId, id } = command;
    const tenant = Identifier.create(tenantId);
    const assignmentId = Identifier.create(id);

    const assignment = await this.repository.findById(tenant, assignmentId);
    if (!assignment) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_ASSIGNMENT_NOT_FOUND',
        message: 'Organization assignment not found.',
      });
    }

    await this.repository.delete(assignment);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}
