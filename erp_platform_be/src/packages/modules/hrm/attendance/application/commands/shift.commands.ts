import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { Shift } from '../../domain/aggregates/shift.aggregate';
import * as repo from '../../domain/repositories/shift.repository';
import { parseTimeToDate } from '../../domain/utils/time.utils';
import { CreateShiftDto, UpdateShiftDto } from '../dto/shift.dto';

// --- Commands ---

export class CreateShiftCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateShiftDto,
  ) {}
}

export class UpdateShiftCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateShiftDto,
  ) {}
}

export class DeleteShiftCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateShiftCommand)
export class CreateShiftHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateShiftCommand>
{
  constructor(
    @Inject(repo.SHIFT_REPOSITORY)
    private readonly repository: repo.ShiftRepository,
  ) {
    super();
  }

  async execute(command: CreateShiftCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('Shift', 'code', command.dto.code);
    }

    const entity = Shift.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      startTime: parseTimeToDate(command.dto.startTime),
      endTime: parseTimeToDate(command.dto.endTime),
      breakMinutes: command.dto.breakMinutes,
      isFlexible: command.dto.isFlexible,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateShiftCommand)
export class UpdateShiftHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateShiftCommand>
{
  constructor(
    @Inject(repo.SHIFT_REPOSITORY)
    private readonly repository: repo.ShiftRepository,
  ) {
    super();
  }

  async execute(command: UpdateShiftCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Shift',
      command.id.toString(),
    );

    entity.update(
      command.dto.name,
      parseTimeToDate(command.dto.startTime),
      parseTimeToDate(command.dto.endTime),
      command.dto.breakMinutes,
      command.dto.isFlexible,
    );

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteShiftCommand)
export class DeleteShiftHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteShiftCommand>
{
  constructor(
    @Inject(repo.SHIFT_REPOSITORY)
    private readonly repository: repo.ShiftRepository,
  ) {
    super();
  }

  async execute(command: DeleteShiftCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Shift',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
