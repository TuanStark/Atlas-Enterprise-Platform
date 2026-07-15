import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class ListEmployeesQuery {
  constructor(public readonly tenantId: Identifier) {}
}
