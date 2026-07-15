import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Repositories
import { SALARY_COMPONENT_REPOSITORY } from './domain/repositories/salary-component.repository';
import { SALARY_STRUCTURE_REPOSITORY } from './domain/repositories/salary-structure.repository';
import { EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY } from './domain/repositories/employee-salary-assignment.repository';
import { PAYROLL_PERIOD_REPOSITORY } from './domain/repositories/payroll-period.repository';
import { PAYROLL_REPOSITORY } from './domain/repositories/payroll.repository';

import { PrismaSalaryComponentRepository } from './infrastructure/repositories/prisma-salary-component.repository';
import { PrismaSalaryStructureRepository } from './infrastructure/repositories/prisma-salary-structure.repository';
import { PrismaEmployeeSalaryAssignmentRepository } from './infrastructure/repositories/prisma-employee-salary-assignment.repository';
import { PrismaPayrollPeriodRepository } from './infrastructure/repositories/prisma-payroll-period.repository';
import { PrismaPayrollRepository } from './infrastructure/repositories/prisma-payroll.repository';

// Controllers
import { SalaryComponentController } from './presentation/controllers/salary-component.controller';
import { SalaryStructureController } from './presentation/controllers/salary-structure.controller';
import { EmployeeSalaryAssignmentController } from './presentation/controllers/employee-salary-assignment.controller';
import { PayrollPeriodController } from './presentation/controllers/payroll-period.controller';
import { PayrollController } from './presentation/controllers/payroll.controller';

// Command Handlers
import {
  CreateSalaryComponentHandler,
  UpdateSalaryComponentHandler,
  DeleteSalaryComponentHandler,
} from './application/commands/salary-component.commands';
import {
  CreateSalaryStructureHandler,
  UpdateSalaryStructureHandler,
  DeleteSalaryStructureHandler,
} from './application/commands/salary-structure.commands';
import {
  CreateEmployeeSalaryAssignmentHandler,
  UpdateEmployeeSalaryAssignmentHandler,
  DeleteEmployeeSalaryAssignmentHandler,
} from './application/commands/employee-salary-assignment.commands';
import {
  CreatePayrollPeriodHandler,
  UpdatePayrollPeriodHandler,
  DeletePayrollPeriodHandler,
} from './application/commands/payroll-period.commands';
import {
  CreatePayrollHandler,
  UpdatePayrollHandler,
  DeletePayrollHandler,
  CalculatePayrollHandler,
} from './application/commands/payroll.commands';

// Query Handlers
import {
  GetSalaryComponentHandler,
  ListSalaryComponentsHandler,
} from './application/queries/salary-component.queries';
import {
  GetSalaryStructureHandler,
  ListSalaryStructuresHandler,
} from './application/queries/salary-structure.queries';
import {
  GetEmployeeSalaryAssignmentHandler,
  ListEmployeeSalaryAssignmentsHandler,
  ListSalaryAssignmentsByEmploymentHandler,
} from './application/queries/employee-salary-assignment.queries';
import {
  GetPayrollPeriodHandler,
  ListPayrollPeriodsHandler,
} from './application/queries/payroll-period.queries';
import {
  GetPayrollHandler,
  ListPayrollsHandler,
  ListPayrollsByPeriodHandler,
} from './application/queries/payroll.queries';

const commandHandlers = [
  CreateSalaryComponentHandler,
  UpdateSalaryComponentHandler,
  DeleteSalaryComponentHandler,
  CreateSalaryStructureHandler,
  UpdateSalaryStructureHandler,
  DeleteSalaryStructureHandler,
  CreateEmployeeSalaryAssignmentHandler,
  UpdateEmployeeSalaryAssignmentHandler,
  DeleteEmployeeSalaryAssignmentHandler,
  CreatePayrollPeriodHandler,
  UpdatePayrollPeriodHandler,
  DeletePayrollPeriodHandler,
  CreatePayrollHandler,
  UpdatePayrollHandler,
  DeletePayrollHandler,
  CalculatePayrollHandler,
];

const queryHandlers = [
  GetSalaryComponentHandler,
  ListSalaryComponentsHandler,
  GetSalaryStructureHandler,
  ListSalaryStructuresHandler,
  GetEmployeeSalaryAssignmentHandler,
  ListEmployeeSalaryAssignmentsHandler,
  ListSalaryAssignmentsByEmploymentHandler,
  GetPayrollPeriodHandler,
  ListPayrollPeriodsHandler,
  GetPayrollHandler,
  ListPayrollsHandler,
  ListPayrollsByPeriodHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    SalaryComponentController,
    SalaryStructureController,
    EmployeeSalaryAssignmentController,
    PayrollPeriodController,
    PayrollController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: SALARY_COMPONENT_REPOSITORY,
      useClass: PrismaSalaryComponentRepository,
    },
    {
      provide: SALARY_STRUCTURE_REPOSITORY,
      useClass: PrismaSalaryStructureRepository,
    },
    {
      provide: EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY,
      useClass: PrismaEmployeeSalaryAssignmentRepository,
    },
    {
      provide: PAYROLL_PERIOD_REPOSITORY,
      useClass: PrismaPayrollPeriodRepository,
    },
    {
      provide: PAYROLL_REPOSITORY,
      useClass: PrismaPayrollRepository,
    },
  ],

  exports: [
    SALARY_COMPONENT_REPOSITORY,
    SALARY_STRUCTURE_REPOSITORY,
    EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY,
    PAYROLL_PERIOD_REPOSITORY,
    PAYROLL_REPOSITORY,
  ],
})
export class PayrollModule {}
