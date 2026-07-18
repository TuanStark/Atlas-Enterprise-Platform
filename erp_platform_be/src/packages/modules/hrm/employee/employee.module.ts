import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Domain
import { EMPLOYEE_REPOSITORY } from './domain/repositories/employee.repository';
import { EmployeeDomainService } from './domain/services/employee-domain.service';

// Infrastructure
import { PrismaEmployeeRepository } from './infrastructure/repositories/prisma-employee.repository';

// Commands
import { CreateEmployeeHandler } from './application/commands/create-employee/create-employee.handler';
import { UpdateEmployeeHandler } from './application/commands/update-employee/update-employee.handler';
import {
  SyncEmployeeContactsHandler,
  SyncEmployeeAddressesHandler,
  SyncEmployeeEmergencyContactsHandler,
  SyncEmployeeDocumentsHandler,
} from './application/commands/employee-child.commands';

// Queries
import { GetEmployeeHandler } from './application/queries/get-employee/get-employee.handler';
import { ListEmployeesHandler } from './application/queries/list-employees/list-employees.handler';

// Controllers
import { EmployeeController } from './presentation/controllers/employee.controller';

const commandHandlers = [
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  SyncEmployeeContactsHandler,
  SyncEmployeeAddressesHandler,
  SyncEmployeeEmergencyContactsHandler,
  SyncEmployeeDocumentsHandler,
];
const queryHandlers = [GetEmployeeHandler, ListEmployeesHandler];

import { IdentityModule } from '@core/identity/identity.module';

@Module({
  imports: [CqrsModule, PrismaModule, IdentityModule],

  controllers: [EmployeeController],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    EmployeeDomainService,
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: PrismaEmployeeRepository,
    },
  ],

  exports: [EMPLOYEE_REPOSITORY, EmployeeDomainService],
})
export class EmployeeModule {}
