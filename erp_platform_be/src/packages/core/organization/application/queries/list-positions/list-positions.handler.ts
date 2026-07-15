import { Inject } from '@nestjs/common';

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPositionsQuery } from './list-positions.query';
import * as positionRepository from '@core/organization/domain/repositories/position.repository';
import { PositionReadModel } from '../../read-models/position.read-model';

@QueryHandler(ListPositionsQuery)
export class ListPositionsHandler implements IQueryHandler<ListPositionsQuery> {
  constructor(
    @Inject(positionRepository.POSITION_REPOSITORY)
    private readonly repository: positionRepository.PositionRepository,
  ) {}

  async execute(query: ListPositionsQuery): Promise<PositionReadModel[]> {
    const positions = await this.repository.findAll(query.organizationId);

    return positions.map((position) => ({
      id: position.id.toString(),
      organizationId: position.organizationId.toString(),
      code: position.code,
      name: position.name,
      description: position.description,
      level: position.level,
    }));
  }
}
