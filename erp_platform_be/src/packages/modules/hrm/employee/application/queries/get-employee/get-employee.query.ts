import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class GetEmployeeQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
  ) {}
}
