import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class ListContractsQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly page: number = 1,
    public readonly pageSize: number = 15,
    public readonly status?: string,
  ) {}
}
