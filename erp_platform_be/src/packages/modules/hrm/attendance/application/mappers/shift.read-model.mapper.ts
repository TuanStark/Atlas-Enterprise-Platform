import { Shift } from '../../domain/aggregates/shift.aggregate';
import { formatDateToTimeStr } from '../../domain/utils/time.utils';
import { ShiftReadModel } from '../read-models/shift.read-model';

export class ShiftReadModelMapper {
  static toReadModel(entity: Shift): ShiftReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      startTime: formatDateToTimeStr(entity.startTime),
      endTime: formatDateToTimeStr(entity.endTime),
      breakMinutes: entity.breakMinutes,
      isFlexible: entity.isFlexible,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
