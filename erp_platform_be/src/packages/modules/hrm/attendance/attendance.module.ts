import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Repositories
import { SHIFT_REPOSITORY } from './domain/repositories/shift.repository';
import { SHIFT_ASSIGNMENT_REPOSITORY } from './domain/repositories/shift-assignment.repository';
import { ATTENDANCE_RECORD_REPOSITORY } from './domain/repositories/attendance-record.repository';

import { PrismaShiftRepository } from './infrastructure/repositories/prisma-shift.repository';
import { PrismaShiftAssignmentRepository } from './infrastructure/repositories/prisma-shift-assignment.repository';
import { PrismaAttendanceRecordRepository } from './infrastructure/repositories/prisma-attendance-record.repository';

// Services
import { AttendanceCalculationService } from './domain/services/attendance-calculation.service';

// Controllers
import { ShiftController } from './presentation/controllers/shift.controller';
import { ShiftAssignmentController } from './presentation/controllers/shift-assignment.controller';
import { CheckInOutController } from './presentation/controllers/check-in-out.controller';
import { AttendanceAdjustmentController } from './presentation/controllers/attendance-adjustment.controller';

// Command Handlers
import {
  CreateShiftHandler,
  UpdateShiftHandler,
  DeleteShiftHandler,
} from './application/commands/shift.commands';
import {
  AssignShiftHandler,
  EndShiftAssignmentHandler,
} from './application/commands/shift-assignment.commands';
import { CheckInHandler, CheckOutHandler } from './application/commands/check-in-out.commands';
import {
  RequestAdjustmentHandler,
  ApproveAdjustmentHandler,
  RejectAdjustmentHandler,
} from './application/commands/attendance-adjustment.commands';

// Query Handlers
import { GetShiftHandler, ListShiftsHandler } from './application/queries/shift.queries';
import { ListShiftAssignmentsByEmploymentHandler } from './application/queries/shift-assignment.queries';
import {
  GetAttendanceRecordHandler,
  ListAttendanceRecordsHandler,
  ListAttendanceRecordsByEmploymentHandler,
} from './application/queries/attendance-record.queries';

const commandHandlers = [
  CreateShiftHandler,
  UpdateShiftHandler,
  DeleteShiftHandler,
  AssignShiftHandler,
  EndShiftAssignmentHandler,
  CheckInHandler,
  CheckOutHandler,
  RequestAdjustmentHandler,
  ApproveAdjustmentHandler,
  RejectAdjustmentHandler,
];

const queryHandlers = [
  GetShiftHandler,
  ListShiftsHandler,
  ListShiftAssignmentsByEmploymentHandler,
  GetAttendanceRecordHandler,
  ListAttendanceRecordsHandler,
  ListAttendanceRecordsByEmploymentHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    ShiftController,
    ShiftAssignmentController,
    CheckInOutController,
    AttendanceAdjustmentController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    AttendanceCalculationService,
    {
      provide: SHIFT_REPOSITORY,
      useClass: PrismaShiftRepository,
    },
    {
      provide: SHIFT_ASSIGNMENT_REPOSITORY,
      useClass: PrismaShiftAssignmentRepository,
    },
    {
      provide: ATTENDANCE_RECORD_REPOSITORY,
      useClass: PrismaAttendanceRecordRepository,
    },
  ],

  exports: [
    SHIFT_REPOSITORY,
    SHIFT_ASSIGNMENT_REPOSITORY,
    ATTENDANCE_RECORD_REPOSITORY,
    AttendanceCalculationService,
  ],
})
export class AttendanceModule {}
