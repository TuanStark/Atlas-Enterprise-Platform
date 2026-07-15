import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/leave-balance.repository';
// import { LeaveBalanceReadModel } from '../read-models/leave-balance.read-model';
import { LeaveBalanceReadModelMapper } from '../mappers/leave-balance.read-model.mapper';
import { LeaveBalanceReadModel } from '../read-models/leave-balance.read-model';

// --- Queries ---

export class GetLeaveBalanceQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListLeaveBalancesByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Query Handlers ---

@QueryHandler(GetLeaveBalanceQuery)
export class GetLeaveBalanceHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetLeaveBalanceQuery>
{
  constructor(
    @Inject(repo.LEAVE_BALANCE_REPOSITORY)
    private readonly repository: repo.LeaveBalanceRepository,
  ) {
    super();
  }

  async execute(query: GetLeaveBalanceQuery): Promise<LeaveBalanceReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'LeaveBalance',
      query.id.toString(),
    );
    return LeaveBalanceReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListLeaveBalancesByEmploymentQuery)
export class ListLeaveBalancesByEmploymentHandler implements IQueryHandler<ListLeaveBalancesByEmploymentQuery> {
  constructor(
    @Inject(repo.LEAVE_BALANCE_REPOSITORY)
    private readonly repository: repo.LeaveBalanceRepository,
  ) {}

  async execute(query: ListLeaveBalancesByEmploymentQuery): Promise<LeaveBalanceReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(LeaveBalanceReadModelMapper.toReadModel);
  }
}
