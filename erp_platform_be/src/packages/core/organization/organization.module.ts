import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ORGANIZATION_REPOSITORY,
  ORGANIZATION_UNIT_REPOSITORY,
  ORGANIZATION_UNIT_TYPE_REPOSITORY,
  ORGANIZATION_CALENDAR_REPOSITORY,
  ORGANIZATION_ASSIGNMENT_REPOSITORY,
} from './domain';
import {
  PrismaOrganizationRepository,
  PrismaOrganizationUnitRepository,
  PrismaOrganizationUnitTypeRepository,
  PrismaOrganizationCalendarRepository,
  PrismaOrganizationAssignmentRepository,
} from './infrastructure';
import { PrismaModule } from 'src/database/prisma.module';

// Commands & Handlers
import { CreateOrganizationHandler } from './application/commands/create-organization';
import { UpdateOrganizationHandler } from './application/commands/update-organization';
import { DeleteOrganizationHandler } from './application/commands/delete-organization';
import {
  CreateOrganizationUnitTypeHandler,
  UpdateOrganizationUnitTypeHandler,
  DeleteOrganizationUnitTypeHandler,
} from './application/commands/organization-unit-type.commands';
import {
  CreateOrganizationUnitHandler,
  UpdateOrganizationUnitHandler,
  DeleteOrganizationUnitHandler,
  MoveOrganizationUnitHandler,
} from './application/commands/organization-unit.commands';
import {
  CreateOrganizationCalendarHandler,
  UpdateOrganizationCalendarHandler,
  DeleteOrganizationCalendarHandler,
} from './application/commands/organization-calendar.commands';
import {
  CreateOrganizationAssignmentHandler,
  UpdateOrganizationAssignmentHandler,
  DeleteOrganizationAssignmentHandler,
} from './application/commands/organization-assignment.commands';

// Queries & Handlers
import { GetOrganizationHandler } from './application/queries/get-organization/get-organization.handler';
import { ListOrganizationsHandler } from './application/queries/list-organizations/list-organizations.handler';
import {
  GetOrganizationUnitTypeHandler,
  ListOrganizationUnitTypesHandler,
} from './application/queries/organization-unit-type.queries';
import {
  GetOrganizationUnitHandler,
  ListOrganizationUnitsHandler,
  GetOrganizationUnitTreeHandler,
} from './application/queries/organization-unit.queries';
import {
  GetOrganizationCalendarHandler,
  ListOrganizationCalendarsHandler,
} from './application/queries/organization-calendar.queries';
import {
  GetOrganizationAssignmentHandler,
  ListOrganizationAssignmentsHandler,
  ListAssignmentsByEmploymentHandler,
} from './application/queries/organization-assignment.queries';

// Controllers
import { OrganizationController } from './presentation/controllers/organization.controller';
import { OrganizationUnitTypeController } from './presentation/controllers/organization-unit-type.controller';
import { OrganizationUnitController } from './presentation/controllers/organization-unit.controller';
import { OrganizationCalendarController } from './presentation/controllers/organization-calendar.controller';
import { OrganizationAssignmentController } from './presentation/controllers/organization-assignment.controller';

const commandHandlers = [
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  DeleteOrganizationHandler,
  CreateOrganizationUnitTypeHandler,
  UpdateOrganizationUnitTypeHandler,
  DeleteOrganizationUnitTypeHandler,
  CreateOrganizationUnitHandler,
  UpdateOrganizationUnitHandler,
  DeleteOrganizationUnitHandler,
  MoveOrganizationUnitHandler,
  CreateOrganizationCalendarHandler,
  UpdateOrganizationCalendarHandler,
  DeleteOrganizationCalendarHandler,
  CreateOrganizationAssignmentHandler,
  UpdateOrganizationAssignmentHandler,
  DeleteOrganizationAssignmentHandler,
];

const queryHandlers = [
  GetOrganizationHandler,
  ListOrganizationsHandler,
  GetOrganizationUnitTypeHandler,
  ListOrganizationUnitTypesHandler,
  GetOrganizationUnitHandler,
  ListOrganizationUnitsHandler,
  GetOrganizationUnitTreeHandler,
  GetOrganizationCalendarHandler,
  ListOrganizationCalendarsHandler,
  GetOrganizationAssignmentHandler,
  ListOrganizationAssignmentsHandler,
  ListAssignmentsByEmploymentHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    OrganizationController,
    OrganizationUnitTypeController,
    OrganizationUnitController,
    OrganizationCalendarController,
    OrganizationAssignmentController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,

    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: ORGANIZATION_UNIT_REPOSITORY,
      useClass: PrismaOrganizationUnitRepository,
    },
    {
      provide: ORGANIZATION_UNIT_TYPE_REPOSITORY,
      useClass: PrismaOrganizationUnitTypeRepository,
    },
    {
      provide: ORGANIZATION_CALENDAR_REPOSITORY,
      useClass: PrismaOrganizationCalendarRepository,
    },
    {
      provide: ORGANIZATION_ASSIGNMENT_REPOSITORY,
      useClass: PrismaOrganizationAssignmentRepository,
    },
  ],

  exports: [
    ORGANIZATION_REPOSITORY,
    ORGANIZATION_UNIT_REPOSITORY,
    ORGANIZATION_UNIT_TYPE_REPOSITORY,
    ORGANIZATION_CALENDAR_REPOSITORY,
    ORGANIZATION_ASSIGNMENT_REPOSITORY,
  ],
})
export class OrganizationModule {}
