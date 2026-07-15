import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/leave-type.repository';
import { LeaveTypeReadModel } from '../read-models/leave-type.read-model';
import { LeaveTypeReadModelMapper } from '../mappers/leave-type.read-model.mapper';

// --- Queries ---

export class GetLeaveTypeQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListLeaveTypesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Query Handlers ---

@QueryHandler(GetLeaveTypeQuery)
export class GetLeaveTypeHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetLeaveTypeQuery>
{
  constructor(
    @Inject(repo.LEAVE_TYPE_REPOSITORY)
    private readonly repository: repo.LeaveTypeRepository,
  ) {
    super();
  }

  async execute(query: GetLeaveTypeQuery): Promise<LeaveTypeReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'LeaveType',
      query.id.toString(),
    );
    return LeaveTypeReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListLeaveTypesQuery)
export class ListLeaveTypesHandler implements IQueryHandler<ListLeaveTypesQuery> {
  constructor(
    @Inject(repo.LEAVE_TYPE_REPOSITORY)
    private readonly repository: repo.LeaveTypeRepository,
  ) {}

  async execute(query: ListLeaveTypesQuery): Promise<LeaveTypeReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(LeaveTypeReadModelMapper.toReadModel);
  }
}
