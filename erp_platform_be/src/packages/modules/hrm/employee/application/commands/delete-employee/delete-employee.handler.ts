import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteEmployeeCommand } from './delete-employee.command';
import * as employeeRepo from '../../../domain/repositories/employee.repository';

@CommandHandler(DeleteEmployeeCommand)
export class DeleteEmployeeHandler implements ICommandHandler<DeleteEmployeeCommand> {
  constructor(
    @Inject(employeeRepo.EMPLOYEE_REPOSITORY)
    private readonly repository: employeeRepo.EmployeeRepository,
  ) {}

  async execute(command: DeleteEmployeeCommand): Promise<void> {
    const employee = await this.repository.findById(command.tenantId, command.employeeId);
    if (!employee) {
      throw new NotFoundException(`Employee ${command.employeeId.toString()} not found`);
    }

    await this.repository.delete(employee);
  }
}
