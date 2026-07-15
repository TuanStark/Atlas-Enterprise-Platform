import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LEAVE_REQUEST_REPOSITORY } from '../repositories/leave-request.repository';
import type { LeaveRequestRepository } from '../repositories/leave-request.repository';
import { LEAVE_BALANCE_REPOSITORY } from '../repositories/leave-balance.repository';
import type { LeaveBalanceRepository } from '../repositories/leave-balance.repository';
import { LeaveBalancePersistenceMapper } from '../../infrastructure/mappers/leave-balance.persistence.mapper';
import { LeaveRequestPersistenceMapper } from '../../infrastructure/mappers/leave-request.persistence.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeaveApprovalDomainService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LEAVE_REQUEST_REPOSITORY)
    private readonly requestRepo: LeaveRequestRepository,
    @Inject(LEAVE_BALANCE_REPOSITORY)
    private readonly balanceRepo: LeaveBalanceRepository,
  ) {}

  async approve(
    tenantId: Identifier,
    requestId: Identifier,
    approvedByPrincipalId: string,
  ): Promise<void> {
    const request = await this.requestRepo.findById(tenantId, requestId);
    if (!request) {
      throw new Error(`LeaveRequest not found: ${requestId}`);
    }

    const year = request.startDate.getFullYear();

    const balance = await this.balanceRepo.findByEmploymentAndTypeAndYear(
      tenantId,
      request.employmentId,
      request.leaveTypeId,
      year,
    );

    if (!balance) {
      throw new Error(
        `Leave balance not initialized for Employment: ${request.employmentId}, Type: ${request.leaveTypeId}, Year: ${year}`,
      );
    }

    if (balance.remainingDays < request.totalDays) {
      throw new Error(
        `Insufficient leave balance remaining: ${balance.remainingDays} days available, requested ${request.totalDays}`,
      );
    }

    // Apply domain model updates
    request.approve();
    balance.approveDays(request.totalDays);

    // Save atomic transaction using Prisma
    await this.prisma.$transaction(async (tx) => {
      // 1. Update LeaveRequest
      const reqPersistence = LeaveRequestPersistenceMapper.toPersistence(request);
      await tx.leaveRequest.update({
        where: { id: reqPersistence.id },
        data: {
          status: reqPersistence.status,
          updatedAt: reqPersistence.updatedAt,
        },
      });

      // 2. Update LeaveBalance
      const balPersistence = LeaveBalancePersistenceMapper.toPersistence(balance);
      await tx.leaveBalance.update({
        where: { id: balPersistence.id },
        data: {
          usedDays: balPersistence.usedDays,
          pendingDays: balPersistence.pendingDays,
          remainingDays: balPersistence.remainingDays,
          updatedAt: balPersistence.updatedAt,
        },
      });

      // 3. Create LeaveTransaction log
      await tx.leaveTransaction.create({
        data: {
          id: Identifier.create().toString(),
          tenantId: tenantId.toString(),
          leaveBalanceId: balance.id.toString(),
          leaveRequestId: request.id.toString(),
          transactionType: 'deduct',
          days: new Prisma.Decimal(request.totalDays),
          description: `Approved leave request from ${request.startDate.toISOString().split('T')[0]} to ${request.endDate.toISOString().split('T')[0]}. Reason: ${request.reason || 'N/A'}`,
          createdAt: new Date(),
        },
      });
    });
  }

  async reject(
    tenantId: Identifier,
    requestId: Identifier,
    approvedByPrincipalId: string,
  ): Promise<void> {
    const request = await this.requestRepo.findById(tenantId, requestId);
    if (!request) {
      throw new Error(`LeaveRequest not found: ${requestId}`);
    }

    const year = request.startDate.getFullYear();

    const balance = await this.balanceRepo.findByEmploymentAndTypeAndYear(
      tenantId,
      request.employmentId,
      request.leaveTypeId,
      year,
    );

    request.reject();
    if (balance) {
      balance.rejectDays(request.totalDays);
    }

    await this.prisma.$transaction(async (tx) => {
      // Update request status
      const reqPersistence = LeaveRequestPersistenceMapper.toPersistence(request);
      await tx.leaveRequest.update({
        where: { id: reqPersistence.id },
        data: {
          status: reqPersistence.status,
          updatedAt: reqPersistence.updatedAt,
        },
      });

      // Update balance if exists
      if (balance) {
        const balPersistence = LeaveBalancePersistenceMapper.toPersistence(balance);
        await tx.leaveBalance.update({
          where: { id: balPersistence.id },
          data: {
            pendingDays: balPersistence.pendingDays,
            updatedAt: balPersistence.updatedAt,
          },
        });
      }
    });
  }
}
