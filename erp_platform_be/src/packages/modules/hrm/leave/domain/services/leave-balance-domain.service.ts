import { Inject, Injectable } from '@nestjs/common';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EMPLOYMENT_REPOSITORY } from '../../../employment/domain/repositories/employment.repository';
import type { EmploymentRepository } from '../../../employment/domain/repositories/employment.repository';
import { LEAVE_POLICY_REPOSITORY } from '../repositories/leave-policy.repository';
import type { LeavePolicyRepository } from '../repositories/leave-policy.repository';
import { LEAVE_BALANCE_REPOSITORY } from '../repositories/leave-balance.repository';
import type { LeaveBalanceRepository } from '../repositories/leave-balance.repository';
import { LeaveBalance } from '../aggregates/leave-balance.aggregate';

@Injectable()
export class LeaveBalanceDomainService {
  constructor(
    @Inject(EMPLOYMENT_REPOSITORY)
    private readonly employmentRepo: EmploymentRepository,
    @Inject(LEAVE_POLICY_REPOSITORY)
    private readonly policyRepo: LeavePolicyRepository,
    @Inject(LEAVE_BALANCE_REPOSITORY)
    private readonly balanceRepo: LeaveBalanceRepository,
  ) {}

  async initializeBalancesForEmployment(
    tenantId: Identifier,
    employmentId: Identifier,
    year: number,
  ): Promise<void> {
    const employment = await this.employmentRepo.findById(tenantId, employmentId);
    if (!employment) {
      throw new Error(`Employment not found: ${employmentId}`);
    }

    const empTypeId = employment.employmentTypeId;

    const allPolicies = await this.policyRepo.findAll(tenantId);

    const matchingPolicies = allPolicies.filter((policy) => {
      if (empTypeId && policy.employmentTypeId) {
        return policy.employmentTypeId.equals(empTypeId);
      }
      return !policy.employmentTypeId;
    });

    for (const policy of matchingPolicies) {
      const existing = await this.balanceRepo.findByEmploymentAndTypeAndYear(
        tenantId,
        employmentId,
        policy.leaveTypeId,
        year,
      );

      if (!existing) {
        const balance = LeaveBalance.create({
          tenantId,
          employmentId,
          leaveTypeId: policy.leaveTypeId,
          leaveYear: year,
          entitledDays: policy.annualDays,
        });

        await this.balanceRepo.save(balance);
      }
    }
  }
}
