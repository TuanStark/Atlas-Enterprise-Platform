import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/leave-request.repository';
import { LeaveRequestReadModel } from '../read-models/leave-request.read-model';
import { LeaveRequestReadModelMapper } from '../mappers/leave-request.read-model.mapper';
// import { LeaveRequestReadModel } from '../read-models/leave-request.read-model';
// import { LeaveRequestReadModelMapper } from '../mappers/leave-request.read-model.mapper';

// --- Queries ---

export class GetLeaveRequestQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListLeaveRequestsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListLeaveRequestsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Query Handlers ---

@QueryHandler(GetLeaveRequestQuery)
export class GetLeaveRequestHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetLeaveRequestQuery>
{
  constructor(
    @Inject(repo.LEAVE_REQUEST_REPOSITORY)
    private readonly repository: repo.LeaveRequestRepository,
  ) {
    super();
  }

  async execute(query: GetLeaveRequestQuery): Promise<LeaveRequestReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'LeaveRequest',
      query.id.toString(),
    );
    return LeaveRequestReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListLeaveRequestsQuery)
export class ListLeaveRequestsHandler implements IQueryHandler<ListLeaveRequestsQuery> {
  constructor(
    @Inject(repo.LEAVE_REQUEST_REPOSITORY)
    private readonly repository: repo.LeaveRequestRepository,
  ) {}

  async execute(query: ListLeaveRequestsQuery): Promise<LeaveRequestReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(LeaveRequestReadModelMapper.toReadModel);
  }
}

@QueryHandler(ListLeaveRequestsByEmploymentQuery)
export class ListLeaveRequestsByEmploymentHandler implements IQueryHandler<ListLeaveRequestsByEmploymentQuery> {
  constructor(
    @Inject(repo.LEAVE_REQUEST_REPOSITORY)
    private readonly repository: repo.LeaveRequestRepository,
  ) {}

  async execute(query: ListLeaveRequestsByEmploymentQuery): Promise<LeaveRequestReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(LeaveRequestReadModelMapper.toReadModel);
  }
}
