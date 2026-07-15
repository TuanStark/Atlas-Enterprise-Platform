import { ShiftAssignment } from '../../domain/entities/shift-assignment.entity';
import { ShiftAssignmentReadModel } from '../read-models/shift-assignment.read-model';

export class ShiftAssignmentReadModelMapper {
  static toReadModel(entity: ShiftAssignment): ShiftAssignmentReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      shiftId: entity.shiftId.toString(),
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo,
      isPrimary: entity.isPrimary,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
