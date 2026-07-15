import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { LeaveType } from '../../domain/aggregates/leave-type.aggregate';
import * as repo from '../../domain/repositories/leave-type.repository';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from '../dto/leave-type.dto';

// --- Commands ---

export class CreateLeaveTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateLeaveTypeDto,
  ) {}
}

export class UpdateLeaveTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateLeaveTypeDto,
  ) {}
}

export class DeleteLeaveTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateLeaveTypeCommand)
export class CreateLeaveTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateLeaveTypeCommand>
{
  constructor(
    @Inject(repo.LEAVE_TYPE_REPOSITORY)
    private readonly repository: repo.LeaveTypeRepository,
  ) {
    super();
  }

  async execute(command: CreateLeaveTypeCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('LeaveType', 'code', command.dto.code);
    }

    const entity = LeaveType.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      isPaid: command.dto.isPaid,
      requiresAttachment: command.dto.requiresAttachment,
      color: command.dto.color,
      description: command.dto.description,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateLeaveTypeCommand)
export class UpdateLeaveTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateLeaveTypeCommand>
{
  constructor(
    @Inject(repo.LEAVE_TYPE_REPOSITORY)
    private readonly repository: repo.LeaveTypeRepository,
  ) {
    super();
  }

  async execute(command: UpdateLeaveTypeCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'LeaveType',
      command.id.toString(),
    );

    entity.update(
      command.dto.name,
      command.dto.isPaid,
      command.dto.requiresAttachment,
      command.dto.color,
      command.dto.description,
    );

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteLeaveTypeCommand)
export class DeleteLeaveTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteLeaveTypeCommand>
{
  constructor(
    @Inject(repo.LEAVE_TYPE_REPOSITORY)
    private readonly repository: repo.LeaveTypeRepository,
  ) {
    super();
  }

  async execute(command: DeleteLeaveTypeCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'LeaveType',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
