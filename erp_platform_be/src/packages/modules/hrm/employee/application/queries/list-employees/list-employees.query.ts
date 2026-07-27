import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class ListEmployeesQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly page: number = 1,
    public readonly pageSize: number = 20,
    public readonly searchText?: string,
    public readonly status?: string,
    public readonly departmentId?: string,
  ) {}
}
