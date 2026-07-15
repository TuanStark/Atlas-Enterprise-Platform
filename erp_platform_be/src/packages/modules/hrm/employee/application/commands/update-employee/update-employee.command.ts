import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { UpdateEmployeeDto } from '../../dto/update-employee.dto';

export class UpdateEmployeeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
    public readonly dto: UpdateEmployeeDto,
  ) {}
}
