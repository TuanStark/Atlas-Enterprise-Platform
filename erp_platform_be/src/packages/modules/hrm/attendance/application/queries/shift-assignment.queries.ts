import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as repo from '../../domain/repositories/shift-assignment.repository';
import { ShiftAssignmentReadModel } from '../read-models/shift-assignment.read-model';
import { ShiftAssignmentReadModelMapper } from '../mappers/shift-assignment.read-model.mapper';

// --- Queries ---

export class ListShiftAssignmentsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(ListShiftAssignmentsByEmploymentQuery)
export class ListShiftAssignmentsByEmploymentHandler implements IQueryHandler<ListShiftAssignmentsByEmploymentQuery> {
  constructor(
    @Inject(repo.SHIFT_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.ShiftAssignmentRepository,
  ) {}

  async execute(query: ListShiftAssignmentsByEmploymentQuery): Promise<ShiftAssignmentReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(ShiftAssignmentReadModelMapper.toReadModel);
  }
}
