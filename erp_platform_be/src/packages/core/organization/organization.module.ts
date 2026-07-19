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
import { OrganizationController } from './presentation/controllers/organization.controller';
import { OrganizationUnitTypeController } from './presentation/controllers/organization-unit-type.controller';
import { OrganizationUnitController } from './presentation/controllers/organization-unit.controller';
import { OrganizationCalendarController } from './presentation/controllers/organization-calendar.controller';
import { OrganizationAssignmentController } from './presentation/controllers/organization-assignment.controller';
import { PositionController } from './presentation/controllers/position.controller';
import { POSITION_REPOSITORY } from './domain/repositories/position.repository';
import { PrismaPositionRepository } from './infrastructure/repositories/prisma-position.repository';
import { CreatePositionHandler } from './application/commands/create-position/create-position.handler';
import { UpdatePositionHandler } from './application/commands/update-position/update-position.handler';
import { DeletePositionHandler } from './application/commands/delete-position/delete-position.handler';
import { GetPositionHandler } from './application/queries/get-position/get-position.handler';
import { ListPositionsHandler } from './application/queries/list-positions/list-positions.handler';
import { PositionApplicationService } from './application/services/position-application.service';
import { PositionDomainService } from './domain/services/position-domain.service';

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
  CreatePositionHandler,
  UpdatePositionHandler,
  DeletePositionHandler,
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
  GetPositionHandler,
  ListPositionsHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    OrganizationController,
    OrganizationUnitTypeController,
    OrganizationUnitController,
    OrganizationCalendarController,
    OrganizationAssignmentController,
    PositionController,
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
    {
      provide: POSITION_REPOSITORY,
      useClass: PrismaPositionRepository,
    },
    PositionApplicationService,
    PositionDomainService,
  ],

  exports: [
    ORGANIZATION_REPOSITORY,
    ORGANIZATION_UNIT_REPOSITORY,
    ORGANIZATION_UNIT_TYPE_REPOSITORY,
    ORGANIZATION_CALENDAR_REPOSITORY,
    ORGANIZATION_ASSIGNMENT_REPOSITORY,
    POSITION_REPOSITORY,
  ],
})
export class OrganizationModule { }
