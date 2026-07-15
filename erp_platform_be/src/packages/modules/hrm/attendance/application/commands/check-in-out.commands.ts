import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityNotFoundException } from '@shared-kernel/exceptions';
import { AttendanceRecord } from '../../domain/aggregates/attendance-record.aggregate';
import * as recordRepo from '../../domain/repositories/attendance-record.repository';
import * as shiftAssignRepo from '../../domain/repositories/shift-assignment.repository';
import * as shiftRepo from '../../domain/repositories/shift.repository';
import { AttendanceCalculationService } from '../../domain/services/attendance-calculation.service';
import { CheckInDto, CheckOutDto } from '../dto/check-in-out.dto';
import { AttendanceSource } from '@prisma/client';

// --- Commands ---

export class CheckInCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CheckInDto,
  ) {}
}

export class CheckOutCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly recordId: Identifier,
    public readonly dto: CheckOutDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(CheckInCommand)
export class CheckInHandler extends BaseCommandHandler implements ICommandHandler<CheckInCommand> {
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

  async execute(command: CheckInCommand): Promise<Identifier> {
    const { tenantId, dto } = command;
    const checkInTime = dto.checkInAt ? new Date(dto.checkInAt) : new Date();
    const employmentId = Identifier.create(dto.employmentId);

    // Find active ShiftAssignment
    const activeAssignment = await this.shiftAssignmentRepo.findActiveByEmploymentId(
      tenantId,
      employmentId,
      checkInTime,
    );

    let shift;
    if (activeAssignment) {
      shift = await this.shiftRepo.findById(tenantId, activeAssignment.shiftId);
    }

    // Check if record already exists for this day
    let record = await this.repository.findByEmploymentIdAndDate(
      tenantId,
      employmentId,
      checkInTime,
    );

    let isNew = false;
    if (!record) {
      isNew = true;
      record = AttendanceRecord.create({
        tenantId,
        employmentId,
        shiftAssignmentId: activeAssignment?.id,
        attendanceDate: checkInTime,
        checkInAt: checkInTime,
        source: dto.source ?? AttendanceSource.web,
        deviceId: dto.deviceId,
      });
    } else {
      record.checkIn(checkInTime, dto.source ?? AttendanceSource.web, dto.deviceId);
    }

    // Recalculate
    const calcs = this.calculationService.calculate(
      record.attendanceDate,
      record.checkInAt,
      record.checkOutAt,
      shift ?? undefined,
    );

    record.updateCalculations(calcs);

    if (isNew) {
      await this.repository.save(record);
    } else {
      await this.repository.update(record);
    }

    return record.id;
  }
}

@CommandHandler(CheckOutCommand)
export class CheckOutHandler
  extends BaseCommandHandler
  implements ICommandHandler<CheckOutCommand>
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

  async execute(command: CheckOutCommand): Promise<void> {
    const { tenantId, recordId, dto } = command;
    const checkOutTime = dto.checkOutAt ? new Date(dto.checkOutAt) : new Date();

    const record = this.ensureFound(
      await this.repository.findById(tenantId, recordId),
      'AttendanceRecord',
      recordId.toString(),
    );

    record.checkOut(checkOutTime);

    // Fetch shift
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

    // Recalculate
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
