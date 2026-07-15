import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateEmployeeDto } from '../../dto/create-employee.dto';

export class CreateEmployeeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateEmployeeDto,
  ) {}
}
