import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class DeleteEmployeeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
  ) {}
}
