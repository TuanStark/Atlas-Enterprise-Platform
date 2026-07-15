import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { LeaveRequest } from '../../domain/aggregates/leave-request.aggregate';
import * as requestRepo from '../../domain/repositories/leave-request.repository';
import * as balanceRepo from '../../domain/repositories/leave-balance.repository';
import { LeaveApprovalDomainService } from '../../domain/services/leave-approval-domain.service';
import { CreateLeaveRequestDto } from '../dto/leave-request.dto';
import { PrismaService } from 'src/database/prisma.service';
import { LeaveRequestPersistenceMapper } from '../../infrastructure/mappers/leave-request.persistence.mapper';
import { LeaveBalancePersistenceMapper } from '../../infrastructure/mappers/leave-balance.persistence.mapper';

// --- Commands ---

export class CreateLeaveRequestCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateLeaveRequestDto,
  ) {}
}

export class ApproveLeaveRequestCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly approvedByPrincipalId: string,
  ) {}
}

export class RejectLeaveRequestCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly approvedByPrincipalId: string,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateLeaveRequestCommand)
export class CreateLeaveRequestHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateLeaveRequestCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    @Inject(requestRepo.LEAVE_REQUEST_REPOSITORY)
    private readonly requestRepository: requestRepo.LeaveRequestRepository,
    @Inject(balanceRepo.LEAVE_BALANCE_REPOSITORY)
    private readonly balanceRepository: balanceRepo.LeaveBalanceRepository,
  ) {
    super();
  }

  async execute(command: CreateLeaveRequestCommand): Promise<Identifier> {
    const { tenantId, dto } = command;
    const employmentId = Identifier.create(dto.employmentId);
    const leaveTypeId = Identifier.create(dto.leaveTypeId);
    const startDate = new Date(dto.startDate);
    const year = startDate.getFullYear();

    // Check balance first
    const balance = await this.balanceRepository.findByEmploymentAndTypeAndYear(
      tenantId,
      employmentId,
      leaveTypeId,
      year,
    );

    if (!balance) {
      throw new Error(
        `Leave balance not initialized for Employment: ${dto.employmentId}, Type: ${dto.leaveTypeId}, Year: ${year}`,
      );
    }

    if (balance.remainingDays < dto.totalDays) {
      throw new Error(
        `Insufficient leave balance remaining: ${balance.remainingDays} days available, requested ${dto.totalDays}`,
      );
    }

    const request = LeaveRequest.create({
      tenantId,
      employmentId,
      leaveTypeId,
      startDate,
      endDate: new Date(dto.endDate),
      totalDays: dto.totalDays,
      reason: dto.reason,
    });

    // Mark days as pending in domain model
    balance.requestDays(dto.totalDays);

    // Save atomic transaction using Prisma
    await this.prisma.$transaction(async (tx) => {
      // 1. Create leave request
      const reqPersistence = LeaveRequestPersistenceMapper.toPersistence(request);
      await tx.leaveRequest.create({ data: reqPersistence });

      // 2. Update leave balance pendingDays
      const balPersistence = LeaveBalancePersistenceMapper.toPersistence(balance);
      await tx.leaveBalance.update({
        where: { id: balPersistence.id },
        data: {
          pendingDays: balPersistence.pendingDays,
          updatedAt: balPersistence.updatedAt,
        },
      });
    });

    return request.id;
  }
}

@CommandHandler(ApproveLeaveRequestCommand)
export class ApproveLeaveRequestHandler
  extends BaseCommandHandler
  implements ICommandHandler<ApproveLeaveRequestCommand>
{
  constructor(private readonly service: LeaveApprovalDomainService) {
    super();
  }

  async execute(command: ApproveLeaveRequestCommand): Promise<void> {
    await this.service.approve(command.tenantId, command.id, command.approvedByPrincipalId);
  }
}

@CommandHandler(RejectLeaveRequestCommand)
export class RejectLeaveRequestHandler
  extends BaseCommandHandler
  implements ICommandHandler<RejectLeaveRequestCommand>
{
  constructor(private readonly service: LeaveApprovalDomainService) {
    super();
  }

  async execute(command: RejectLeaveRequestCommand): Promise<void> {
    await this.service.reject(command.tenantId, command.id, command.approvedByPrincipalId);
  }
}
