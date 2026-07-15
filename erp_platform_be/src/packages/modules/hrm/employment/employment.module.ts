import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Domain
import { EMPLOYMENT_REPOSITORY } from './domain/repositories/employment.repository';
import { EmploymentDomainService } from './domain/services/employment-domain.service';

// Infrastructure
import { PrismaEmploymentRepository } from './infrastructure/repositories/prisma-employment.repository';

// Command Handlers
import {
  CreateEmploymentHandler,
  UpdateEmploymentStatusHandler,
  TerminateEmploymentHandler,
  CreateEmploymentContractHandler,
} from './application/commands/employment.commands';

// Query Handlers
import {
  GetEmploymentHandler,
  ListEmploymentsHandler,
  GetEmploymentsByEmployeeHandler,
} from './application/queries/employment.queries';

// Controllers
import { EmploymentController } from './presentation/controllers/employment.controller';

const commandHandlers = [
  CreateEmploymentHandler,
  UpdateEmploymentStatusHandler,
  TerminateEmploymentHandler,
  CreateEmploymentContractHandler,
];

const queryHandlers = [
  GetEmploymentHandler,
  ListEmploymentsHandler,
  GetEmploymentsByEmployeeHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [EmploymentController],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    EmploymentDomainService,
    {
      provide: EMPLOYMENT_REPOSITORY,
      useClass: PrismaEmploymentRepository,
    },
  ],

  exports: [EMPLOYMENT_REPOSITORY, EmploymentDomainService],
})
export class EmploymentModule {}
