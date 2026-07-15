import { LeaveBalance } from '../../domain/aggregates/leave-balance.aggregate';
import { LeaveBalanceReadModel } from '../read-models/leave-balance.read-model';

export class LeaveBalanceReadModelMapper {
  static toReadModel(entity: LeaveBalance): LeaveBalanceReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      leaveYear: entity.leaveYear,
      entitledDays: entity.entitledDays,
      usedDays: entity.usedDays,
      pendingDays: entity.pendingDays,
      remainingDays: entity.remainingDays,
      updatedAt: entity.updatedAt,
    };
  }
}
