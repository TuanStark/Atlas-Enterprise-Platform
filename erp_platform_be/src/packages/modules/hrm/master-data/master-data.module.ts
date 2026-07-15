import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Repositories
import { EMPLOYMENT_TYPE_REPOSITORY } from './domain/repositories/employment-type.repository';
import { CONTRACT_TYPE_REPOSITORY } from './domain/repositories/contract-type.repository';
import { JOB_TITLE_REPOSITORY } from './domain/repositories/job-title.repository';
import { WORK_LOCATION_REPOSITORY } from './domain/repositories/work-location.repository';

import { PrismaEmploymentTypeRepository } from './infrastructure/repositories/prisma-employment-type.repository';
import { PrismaContractTypeRepository } from './infrastructure/repositories/prisma-contract-type.repository';
import { PrismaJobTitleRepository } from './infrastructure/repositories/prisma-job-title.repository';
import { PrismaWorkLocationRepository } from './infrastructure/repositories/prisma-work-location.repository';

// Command Handlers
import {
  CreateEmploymentTypeHandler,
  UpdateEmploymentTypeHandler,
  DeleteEmploymentTypeHandler,
} from './application/commands/employment-type.commands';
import {
  CreateContractTypeHandler,
  UpdateContractTypeHandler,
  DeleteContractTypeHandler,
} from './application/commands/contract-type.commands';
import {
  CreateJobTitleHandler,
  UpdateJobTitleHandler,
  DeleteJobTitleHandler,
} from './application/commands/job-title.commands';
import {
  CreateWorkLocationHandler,
  UpdateWorkLocationHandler,
  DeleteWorkLocationHandler,
} from './application/commands/work-location.commands';

// Query Handlers
import {
  GetEmploymentTypeHandler,
  ListEmploymentTypesHandler,
  GetContractTypeHandler,
  ListContractTypesHandler,
  GetJobTitleHandler,
  ListJobTitlesHandler,
  GetWorkLocationHandler,
  ListWorkLocationsHandler,
} from './application/queries/master-data.queries';

// Controllers
import { EmploymentTypeController } from './presentation/controllers/employment-type.controller';
import { ContractTypeController } from './presentation/controllers/contract-type.controller';
import { JobTitleController } from './presentation/controllers/job-title.controller';
import { WorkLocationController } from './presentation/controllers/work-location.controller';

const commandHandlers = [
  CreateEmploymentTypeHandler,
  UpdateEmploymentTypeHandler,
  DeleteEmploymentTypeHandler,
  CreateContractTypeHandler,
  UpdateContractTypeHandler,
  DeleteContractTypeHandler,
  CreateJobTitleHandler,
  UpdateJobTitleHandler,
  DeleteJobTitleHandler,
  CreateWorkLocationHandler,
  UpdateWorkLocationHandler,
  DeleteWorkLocationHandler,
];

const queryHandlers = [
  GetEmploymentTypeHandler,
  ListEmploymentTypesHandler,
  GetContractTypeHandler,
  ListContractTypesHandler,
  GetJobTitleHandler,
  ListJobTitlesHandler,
  GetWorkLocationHandler,
  ListWorkLocationsHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    EmploymentTypeController,
    ContractTypeController,
    JobTitleController,
    WorkLocationController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: EMPLOYMENT_TYPE_REPOSITORY,
      useClass: PrismaEmploymentTypeRepository,
    },
    {
      provide: CONTRACT_TYPE_REPOSITORY,
      useClass: PrismaContractTypeRepository,
    },
    {
      provide: JOB_TITLE_REPOSITORY,
      useClass: PrismaJobTitleRepository,
    },
    {
      provide: WORK_LOCATION_REPOSITORY,
      useClass: PrismaWorkLocationRepository,
    },
  ],

  exports: [
    EMPLOYMENT_TYPE_REPOSITORY,
    CONTRACT_TYPE_REPOSITORY,
    JOB_TITLE_REPOSITORY,
    WORK_LOCATION_REPOSITORY,
  ],
})
export class MasterDataModule {}
