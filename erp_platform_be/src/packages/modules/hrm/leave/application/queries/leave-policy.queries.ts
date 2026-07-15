import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/leave-policy.repository';
import { LeavePolicyReadModel } from '../read-models/leave-policy.read-model';
import { LeavePolicyReadModelMapper } from '../mappers/leave-policy.read-model.mapper';
// import { LeavePolicyReadModel } from '../read-models/leave-policy.read-model';
// import { LeavePolicyReadModelMapper } from '../mappers/leave-policy.read-model.mapper';

// --- Queries ---

export class GetLeavePolicyQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListLeavePoliciesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Query Handlers ---

@QueryHandler(GetLeavePolicyQuery)
export class GetLeavePolicyHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetLeavePolicyQuery>
{
  constructor(
    @Inject(repo.LEAVE_POLICY_REPOSITORY)
    private readonly repository: repo.LeavePolicyRepository,
  ) {
    super();
  }

  async execute(query: GetLeavePolicyQuery): Promise<LeavePolicyReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'LeavePolicy',
      query.id.toString(),
    );
    return LeavePolicyReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListLeavePoliciesQuery)
export class ListLeavePoliciesHandler implements IQueryHandler<ListLeavePoliciesQuery> {
  constructor(
    @Inject(repo.LEAVE_POLICY_REPOSITORY)
    private readonly repository: repo.LeavePolicyRepository,
  ) {}

  async execute(query: ListLeavePoliciesQuery): Promise<LeavePolicyReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(LeavePolicyReadModelMapper.toReadModel);
  }
}
