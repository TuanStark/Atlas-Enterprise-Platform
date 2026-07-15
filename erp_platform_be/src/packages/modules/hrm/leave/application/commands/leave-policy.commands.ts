import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { LeavePolicy } from '../../domain/aggregates/leave-policy.aggregate';
import * as repo from '../../domain/repositories/leave-policy.repository';
import { CreateLeavePolicyDto, UpdateLeavePolicyDto } from '../dto/leave-policy.dto';

// --- Commands ---

export class CreateLeavePolicyCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateLeavePolicyDto,
  ) {}
}

export class UpdateLeavePolicyCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateLeavePolicyDto,
  ) {}
}

export class DeleteLeavePolicyCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateLeavePolicyCommand)
export class CreateLeavePolicyHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateLeavePolicyCommand>
{
  constructor(
    @Inject(repo.LEAVE_POLICY_REPOSITORY)
    private readonly repository: repo.LeavePolicyRepository,
  ) {
    super();
  }

  async execute(command: CreateLeavePolicyCommand): Promise<Identifier> {
    const { tenantId, dto } = command;

    if (dto.employmentTypeId) {
      const exists = await this.repository.findByLeaveTypeAndEmploymentType(
        tenantId,
        Identifier.create(dto.leaveTypeId),
        Identifier.create(dto.employmentTypeId),
      );
      if (exists) {
        throw new EntityAlreadyExistsException(
          'LeavePolicy',
          'leaveTypeId + employmentTypeId',
          `${dto.leaveTypeId} + ${dto.employmentTypeId}`,
        );
      }
    }

    const entity = LeavePolicy.create({
      tenantId,
      leaveTypeId: Identifier.create(dto.leaveTypeId),
      employmentTypeId: dto.employmentTypeId ? Identifier.create(dto.employmentTypeId) : undefined,
      annualDays: dto.annualDays,
      maxConsecutiveDays: dto.maxConsecutiveDays,
      carryForwardLimit: dto.carryForwardLimit,
      requiresApproval: dto.requiresApproval,
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateLeavePolicyCommand)
export class UpdateLeavePolicyHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateLeavePolicyCommand>
{
  constructor(
    @Inject(repo.LEAVE_POLICY_REPOSITORY)
    private readonly repository: repo.LeavePolicyRepository,
  ) {
    super();
  }

  async execute(command: UpdateLeavePolicyCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'LeavePolicy',
      command.id.toString(),
    );

    entity.update(
      command.dto.annualDays,
      command.dto.maxConsecutiveDays,
      command.dto.carryForwardLimit,
      command.dto.requiresApproval,
      command.dto.effectiveFrom ? new Date(command.dto.effectiveFrom) : undefined,
      command.dto.effectiveTo ? new Date(command.dto.effectiveTo) : undefined,
    );

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteLeavePolicyCommand)
export class DeleteLeavePolicyHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteLeavePolicyCommand>
{
  constructor(
    @Inject(repo.LEAVE_POLICY_REPOSITORY)
    private readonly repository: repo.LeavePolicyRepository,
  ) {
    super();
  }

  async execute(command: DeleteLeavePolicyCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'LeavePolicy',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
