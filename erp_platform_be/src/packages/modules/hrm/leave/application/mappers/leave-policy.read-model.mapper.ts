import { LeavePolicy } from '../../domain/aggregates/leave-policy.aggregate';
import { LeavePolicyReadModel } from '../read-models/leave-policy.read-model';

export class LeavePolicyReadModelMapper {
  static toReadModel(entity: LeavePolicy): LeavePolicyReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      employmentTypeId: entity.employmentTypeId ? entity.employmentTypeId.toString() : undefined,
      annualDays: entity.annualDays,
      maxConsecutiveDays: entity.maxConsecutiveDays,
      carryForwardLimit: entity.carryForwardLimit,
      requiresApproval: entity.requiresApproval,
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
