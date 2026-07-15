import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { ShiftAssignment } from '../../domain/entities/shift-assignment.entity';
import * as repo from '../../domain/repositories/shift-assignment.repository';
import { AssignShiftDto } from '../dto/shift-assignment.dto';

// --- Commands ---

export class AssignShiftCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
    public readonly dto: AssignShiftDto,
  ) {}
}

export class EndShiftAssignmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly effectiveTo: Date,
  ) {}
}

// --- Handlers ---

@CommandHandler(AssignShiftCommand)
export class AssignShiftHandler
  extends BaseCommandHandler
  implements ICommandHandler<AssignShiftCommand>
{
  constructor(
    @Inject(repo.SHIFT_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.ShiftAssignmentRepository,
  ) {
    super();
  }

  async execute(command: AssignShiftCommand): Promise<Identifier> {
    const { tenantId, employmentId, dto } = command;
    const effectiveFromDate = new Date(dto.effectiveFrom);

    // End previous active primary shift assignments before starting a new one
    if (dto.isPrimary !== false) {
      const activeAssignment = await this.repository.findActiveByEmploymentId(
        tenantId,
        employmentId,
        effectiveFromDate,
      );

      if (activeAssignment) {
        // Set previous assignment to end the day before the new one starts
        const endOfPrevious = new Date(effectiveFromDate);
        endOfPrevious.setDate(endOfPrevious.getDate() - 1);
        activeAssignment.endAssignment(endOfPrevious);
        await this.repository.update(activeAssignment);
      }
    }

    const assignment = ShiftAssignment.create({
      tenantId,
      employmentId,
      shiftId: Identifier.create(dto.shiftId),
      effectiveFrom: effectiveFromDate,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      isPrimary: dto.isPrimary,
    });

    await this.repository.save(assignment);
    return assignment.id;
  }
}

@CommandHandler(EndShiftAssignmentCommand)
export class EndShiftAssignmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<EndShiftAssignmentCommand>
{
  constructor(
    @Inject(repo.SHIFT_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.ShiftAssignmentRepository,
  ) {
    super();
  }

  async execute(command: EndShiftAssignmentCommand): Promise<void> {
    const assignment = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'ShiftAssignment',
      command.id.toString(),
    );

    assignment.endAssignment(command.effectiveTo);
    await this.repository.update(assignment);
  }
}
