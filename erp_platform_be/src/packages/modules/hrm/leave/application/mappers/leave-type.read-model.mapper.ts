import { LeaveType } from '../../domain/aggregates/leave-type.aggregate';
import { LeaveTypeReadModel } from '../read-models/leave-type.read-model';

export class LeaveTypeReadModelMapper {
  static toReadModel(entity: LeaveType): LeaveTypeReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      isPaid: entity.isPaid,
      requiresAttachment: entity.requiresAttachment,
      color: entity.color,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
