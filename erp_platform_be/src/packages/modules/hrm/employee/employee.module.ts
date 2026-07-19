import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { EMPLOYEE_REPOSITORY } from './domain/repositories/employee.repository';
import { EmployeeDomainService } from './domain/services/employee-domain.service';
import { PrismaEmployeeRepository } from './infrastructure/repositories/prisma-employee.repository';
import { CreateEmployeeHandler } from './application/commands/create-employee/create-employee.handler';
import { UpdateEmployeeHandler } from './application/commands/update-employee/update-employee.handler';
import {
  SyncEmployeeContactsHandler,
  SyncEmployeeAddressesHandler,
  SyncEmployeeEmergencyContactsHandler,
  SyncEmployeeDocumentsHandler,
} from './application/commands/employee-child.commands';
import { GetEmployeeHandler } from './application/queries/get-employee/get-employee.handler';
import { ListEmployeesHandler } from './application/queries/list-employees/list-employees.handler';
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
import { EmploymentModule } from '../employment/employment.module';
import { OrganizationModule } from '@core/organization/organization.module';
import { PrincipalModule } from '@core/principal/principal.module';

@Module({
  imports: [CqrsModule, PrismaModule, IdentityModule, EmploymentModule, OrganizationModule, PrincipalModule],

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
