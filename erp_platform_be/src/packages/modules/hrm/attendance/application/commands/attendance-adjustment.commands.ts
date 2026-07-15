import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import * as recordRepo from '../../domain/repositories/attendance-record.repository';
import * as shiftAssignRepo from '../../domain/repositories/shift-assignment.repository';
import * as shiftRepo from '../../domain/repositories/shift.repository';
import { AttendanceCalculationService } from '../../domain/services/attendance-calculation.service';
import { RequestAdjustmentDto } from '../dto/attendance-adjustment.dto';

// --- Commands ---

export class RequestAdjustmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly recordId: Identifier,
    public readonly requestedByPrincipalId: string,
    public readonly dto: RequestAdjustmentDto,
  ) {}
}

export class ApproveAdjustmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly recordId: Identifier,
    public readonly adjustmentId: Identifier,
    public readonly approvedByPrincipalId: string,
  ) {}
}

export class RejectAdjustmentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly recordId: Identifier,
    public readonly adjustmentId: Identifier,
    public readonly approvedByPrincipalId: string,
  ) {}
}

// --- Handlers ---

@CommandHandler(RequestAdjustmentCommand)
export class RequestAdjustmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<RequestAdjustmentCommand>
{
  constructor(
    @Inject(recordRepo.ATTENDANCE_RECORD_REPOSITORY)
    private readonly repository: recordRepo.AttendanceRecordRepository,
  ) {
    super();
  }

  async execute(command: RequestAdjustmentCommand): Promise<Identifier> {
    const { tenantId, recordId, requestedByPrincipalId, dto } = command;

    const record = this.ensureFound(
      await this.repository.findById(tenantId, recordId),
      'AttendanceRecord',
      recordId.toString(),
    );

    const adjustment = record.requestAdjustment(
      requestedByPrincipalId,
      dto.reason,
      dto.newCheckIn ? new Date(dto.newCheckIn) : undefined,
      dto.newCheckOut ? new Date(dto.newCheckOut) : undefined,
    );

    await this.repository.update(record);
    return adjustment.id;
  }
}

@CommandHandler(ApproveAdjustmentCommand)
export class ApproveAdjustmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<ApproveAdjustmentCommand>
{
  constructor(
    @Inject(recordRepo.ATTENDANCE_RECORD_REPOSITORY)
    private readonly repository: recordRepo.AttendanceRecordRepository,
    @Inject(shiftAssignRepo.SHIFT_ASSIGNMENT_REPOSITORY)
    private readonly shiftAssignmentRepo: shiftAssignRepo.ShiftAssignmentRepository,
    @Inject(shiftRepo.SHIFT_REPOSITORY)
    private readonly shiftRepo: shiftRepo.ShiftRepository,
    private readonly calculationService: AttendanceCalculationService,
  ) {
    super();
  }

  async execute(command: ApproveAdjustmentCommand): Promise<void> {
    const { tenantId, recordId, adjustmentId, approvedByPrincipalId } = command;

    const record = this.ensureFound(
      await this.repository.findById(tenantId, recordId),
      'AttendanceRecord',
      recordId.toString(),
    );

    // Apply adjustment times to record
    record.approveAdjustment(adjustmentId, approvedByPrincipalId);

    // Fetch shift for recalculation
    let shift;
    if (record.shiftAssignmentId) {
      const assignment = await this.shiftAssignmentRepo.findById(
        tenantId,
        record.shiftAssignmentId,
      );
      if (assignment) {
        shift = await this.shiftRepo.findById(tenantId, assignment.shiftId);
      }
    }

    // Recalculate late, early, worked, overtime
    const calcs = this.calculationService.calculate(
      record.attendanceDate,
      record.checkInAt,
      record.checkOutAt,
      shift ?? undefined,
    );

    record.updateCalculations(calcs);

    await this.repository.update(record);
  }
}

@CommandHandler(RejectAdjustmentCommand)
export class RejectAdjustmentHandler
  extends BaseCommandHandler
  implements ICommandHandler<RejectAdjustmentCommand>
{
  constructor(
    @Inject(recordRepo.ATTENDANCE_RECORD_REPOSITORY)
    private readonly repository: recordRepo.AttendanceRecordRepository,
  ) {
    super();
  }

  async execute(command: RejectAdjustmentCommand): Promise<void> {
    const { tenantId, recordId, adjustmentId, approvedByPrincipalId } = command;

    const record = this.ensureFound(
      await this.repository.findById(tenantId, recordId),
      'AttendanceRecord',
      recordId.toString(),
    );

    record.rejectAdjustment(adjustmentId, approvedByPrincipalId);

    await this.repository.update(record);
  }
}
