import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/shift.repository';
import { ShiftReadModel } from '../read-models/shift.read-model';
import { ShiftReadModelMapper } from '../mappers/shift.read-model.mapper';

// --- Queries ---

export class GetShiftQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListShiftsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Query Handlers ---

@QueryHandler(GetShiftQuery)
export class GetShiftHandler extends BaseQueryHandler implements IQueryHandler<GetShiftQuery> {
  constructor(
    @Inject(repo.SHIFT_REPOSITORY)
    private readonly repository: repo.ShiftRepository,
  ) {
    super();
  }

  async execute(query: GetShiftQuery): Promise<ShiftReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'Shift',
      query.id.toString(),
    );
    return ShiftReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListShiftsQuery)
export class ListShiftsHandler implements IQueryHandler<ListShiftsQuery> {
  constructor(
    @Inject(repo.SHIFT_REPOSITORY)
    private readonly repository: repo.ShiftRepository,
  ) {}

  async execute(query: ListShiftsQuery): Promise<ShiftReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(ShiftReadModelMapper.toReadModel);
  }
}
