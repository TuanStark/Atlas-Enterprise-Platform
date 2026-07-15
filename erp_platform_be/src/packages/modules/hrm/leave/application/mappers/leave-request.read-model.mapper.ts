import { LeaveRequest } from '../../domain/aggregates/leave-request.aggregate';
import { LeaveRequestReadModel } from '../read-models/leave-request.read-model';

export class LeaveRequestReadModelMapper {
  static toReadModel(entity: LeaveRequest): LeaveRequestReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      workflowInstanceId: entity.workflowInstanceId
        ? entity.workflowInstanceId.toString()
        : undefined,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalDays: entity.totalDays,
      reason: entity.reason,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
