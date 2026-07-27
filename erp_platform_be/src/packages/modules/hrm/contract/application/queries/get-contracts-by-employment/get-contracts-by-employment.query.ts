import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class GetContractsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}
