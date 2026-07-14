import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ORGANIZATION_REPOSITORY } from './domain';
import { PrismaOrganizationRepository } from './infrastructure';
import { PrismaModule } from 'src/database/prisma.module';
import { CreateOrganizationHandler } from './application/commands/create-organization';
import { UpdateOrganizationHandler } from './application/commands/update-organization';
import { DeleteOrganizationHandler } from './application/commands/delete-organization';
import { GetOrganizationHandler } from './application/queries/get-organization/get-organization.handler';
import { ListOrganizationsHandler } from './application/queries/list-organizations/list-organizations.handler';
import { OrganizationController } from './presentation/controllers/organization.controller';

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [OrganizationController],

  providers: [
    CreateOrganizationHandler,
    UpdateOrganizationHandler,
    DeleteOrganizationHandler,
    GetOrganizationHandler,
    ListOrganizationsHandler,

    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: PrismaOrganizationRepository,
    },
  ],

  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationModule {}
