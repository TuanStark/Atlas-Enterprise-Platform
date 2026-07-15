import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { EmploymentModule } from '../employment/employment.module';

// Repositories
import { LEAVE_TYPE_REPOSITORY } from './domain/repositories/leave-type.repository';
import { LEAVE_POLICY_REPOSITORY } from './domain/repositories/leave-policy.repository';
import { LEAVE_BALANCE_REPOSITORY } from './domain/repositories/leave-balance.repository';
import { LEAVE_REQUEST_REPOSITORY } from './domain/repositories/leave-request.repository';

import { PrismaLeaveTypeRepository } from './infrastructure/repositories/prisma-leave-type.repository';
import { PrismaLeavePolicyRepository } from './infrastructure/repositories/prisma-leave-policy.repository';
import { PrismaLeaveBalanceRepository } from './infrastructure/repositories/prisma-leave-balance.repository';
import { PrismaLeaveRequestRepository } from './infrastructure/repositories/prisma-leave-request.repository';

// Services
import { LeaveBalanceDomainService } from './domain/services/leave-balance-domain.service';
import { LeaveApprovalDomainService } from './domain/services/leave-approval-domain.service';

// Controllers
import { LeaveTypeController } from './presentation/controllers/leave-type.controller';
import { LeavePolicyController } from './presentation/controllers/leave-policy.controller';
import { LeaveBalanceController } from './presentation/controllers/leave-balance.controller';
import { LeaveRequestController } from './presentation/controllers/leave-request.controller';

// Command Handlers
import {
  CreateLeaveTypeHandler,
  UpdateLeaveTypeHandler,
  DeleteLeaveTypeHandler,
} from './application/commands/leave-type.commands';
import {
  CreateLeavePolicyHandler,
  UpdateLeavePolicyHandler,
  DeleteLeavePolicyHandler,
} from './application/commands/leave-policy.commands';
import {
  InitializeLeaveBalanceHandler,
  AdjustLeaveBalanceHandler,
} from './application/commands/leave-balance.commands';
import {
  CreateLeaveRequestHandler,
  ApproveLeaveRequestHandler,
  RejectLeaveRequestHandler,
} from './application/commands/leave-request.commands';

// Query Handlers
import {
  GetLeaveTypeHandler,
  ListLeaveTypesHandler,
} from './application/queries/leave-type.queries';
import {
  GetLeavePolicyHandler,
  ListLeavePoliciesHandler,
} from './application/queries/leave-policy.queries';
import {
  GetLeaveBalanceHandler,
  ListLeaveBalancesByEmploymentHandler,
} from './application/queries/leave-balance.queries';
import {
  GetLeaveRequestHandler,
  ListLeaveRequestsHandler,
  ListLeaveRequestsByEmploymentHandler,
} from './application/queries/leave-request.queries';

const commandHandlers = [
  CreateLeaveTypeHandler,
  UpdateLeaveTypeHandler,
  DeleteLeaveTypeHandler,
  CreateLeavePolicyHandler,
  UpdateLeavePolicyHandler,
  DeleteLeavePolicyHandler,
  InitializeLeaveBalanceHandler,
  AdjustLeaveBalanceHandler,
  CreateLeaveRequestHandler,
  ApproveLeaveRequestHandler,
  RejectLeaveRequestHandler,
];

const queryHandlers = [
  GetLeaveTypeHandler,
  ListLeaveTypesHandler,
  GetLeavePolicyHandler,
  ListLeavePoliciesHandler,
  GetLeaveBalanceHandler,
  ListLeaveBalancesByEmploymentHandler,
  GetLeaveRequestHandler,
  ListLeaveRequestsHandler,
  ListLeaveRequestsByEmploymentHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule, EmploymentModule],

  controllers: [
    LeaveTypeController,
    LeavePolicyController,
    LeaveBalanceController,
    LeaveRequestController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    LeaveBalanceDomainService,
    LeaveApprovalDomainService,
    {
      provide: LEAVE_TYPE_REPOSITORY,
      useClass: PrismaLeaveTypeRepository,
    },
    {
      provide: LEAVE_POLICY_REPOSITORY,
      useClass: PrismaLeavePolicyRepository,
    },
    {
      provide: LEAVE_BALANCE_REPOSITORY,
      useClass: PrismaLeaveBalanceRepository,
    },
    {
      provide: LEAVE_REQUEST_REPOSITORY,
      useClass: PrismaLeaveRequestRepository,
    },
  ],

  exports: [
    LEAVE_TYPE_REPOSITORY,
    LEAVE_POLICY_REPOSITORY,
    LEAVE_BALANCE_REPOSITORY,
    LEAVE_REQUEST_REPOSITORY,
    LeaveBalanceDomainService,
    LeaveApprovalDomainService,
  ],
})
export class LeaveModule {}
