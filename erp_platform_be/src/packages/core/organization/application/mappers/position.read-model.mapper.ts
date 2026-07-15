import { Position } from '@core/organization/domain/entities/position';
import { PositionReadModel } from '../read-models/position.read-model';

export class PositionReadModelMapper {
  static toReadModel(position: Position): PositionReadModel {
    return {
      id: position.id.toString(),
      organizationId: position.organizationId.toString(),
      code: position.code,
      name: position.name,
      description: position.description,
      level: position.level,
    };
  }
}
